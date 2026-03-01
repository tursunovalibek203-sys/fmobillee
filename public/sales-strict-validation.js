// Savdo va Hisobotlar Qattiq Validatsiya - Frontend
// Savdolar qo'shilib ketmasligi va hisobotlar to'g'ri bo'lishi uchun

(function() {
    'use strict';
    
    // Global validation object
    window.SalesValidation = {
        
        // Savdo qilishdan oldin tekshirish
        async validateBeforeSale(saleData) {
            const errors = [];
            const warnings = [];
            
            // 1. Kassir ID majburiy
            if (!saleData.cashierId) {
                errors.push('❌ Kassir ID yo\'q!');
            }
            
            // 2. Filial ID majburiy
            if (!saleData.branchId && saleData.branchId !== 0) {
                errors.push('❌ Filial ID yo\'q!');
            }
            
            // 3. Mahsulot majburiy
            if (!saleData.product || saleData.product.trim() === '') {
                errors.push('❌ Mahsulot tanlanmagan!');
            }
            
            // 4. Narx majburiy va musbat
            if (!saleData.price || saleData.price <= 0) {
                errors.push('❌ Narx noto\'g\'ri!');
            }
            
            // 5. To'lov summasi tekshiruvi
            if (!saleData.paid || saleData.paid < 0) {
                errors.push('❌ To\'lov summasi noto\'g\'ri!');
            }
            
            // 6. To'lov summasi narxdan kam bo'lsa
            if (saleData.paid < saleData.price) {
                warnings.push(`⚠️  To'lov to'liq emas! (${saleData.paid} < ${saleData.price})`);
            }
            
            // 7. Stock tekshiruvi
            if (saleData.productId) {
                try {
                    const response = await fetch(`/api/products?branchId=${saleData.branchId}`);
                    const products = await response.json();
                    
                    const product = products.find(p => p.productId === saleData.productId);
                    
                    if (product) {
                        if (product.stock <= 0) {
                            errors.push('❌ Mahsulot omborda yo\'q!');
                        } else if (product.stock < (saleData.quantity || 1)) {
                            errors.push(`❌ Yetarli mahsulot yo'q! (Omborda: ${product.stock})`);
                        }
                    }
                } catch (error) {
                    console.error('Stock tekshirishda xato:', error);
                }
            }
            
            // 8. Kassir balansi tekshiruvi
            try {
                const response = await fetch(`/api/cashiers/${saleData.cashierId}`);
                const data = await response.json();
                
                if (data.success && data.cashier) {
                    // Kassir faolmi?
                    if (!data.cashier.isActive) {
                        errors.push('❌ Kassir faol emas!');
                    }
                    
                    // Kassir to'g'ri filialdami?
                    if (data.cashier.branchId !== saleData.branchId) {
                        errors.push('❌ Kassir boshqa filialda!');
                    }
                }
            } catch (error) {
                console.error('Kassir tekshirishda xato:', error);
            }
            
            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };
        },
        
        // Balans tekshiruvi
        async validateBalance(cashierId) {
            try {
                const response = await fetch(`/api/cashiers/${cashierId}`);
                const data = await response.json();
                
                if (!data.success) {
                    return {
                        valid: false,
                        error: '❌ Kassir topilmadi!'
                    };
                }
                
                const cashier = data.cashier;
                
                // Savdolar summasini hisoblash
                const salesResponse = await fetch(`/api/cashier-sales?cashierId=${cashierId}`);
                const salesData = await salesResponse.json();
                
                let totalSales = 0;
                if (salesData.success && salesData.sales) {
                    totalSales = salesData.sales.reduce((sum, sale) => sum + (sale.paid || 0), 0);
                }
                
                // Kirim berishlar summasini hisoblash
                const handoversResponse = await fetch(`/api/cashier-handovers?cashierId=${cashierId}`);
                const handoversData = await handoversResponse.json();
                
                let totalHandovers = 0;
                if (handoversData.success && handoversData.handovers) {
                    totalHandovers = handoversData.handovers.reduce((sum, h) => sum + (h.amount || 0), 0);
                }
                
                // Hisoblangan balans
                const calculatedBalance = totalSales - totalHandovers;
                
                // Database dagi balans
                const dbBalance = cashier.balance || 0;
                
                // Farq
                const difference = Math.abs(calculatedBalance - dbBalance);
                
                if (difference > 0.01) { // 1 sent farq
                    return {
                        valid: false,
                        error: `❌ Balans mos kelmayapti! (DB: $${dbBalance.toFixed(2)}, Hisoblangan: $${calculatedBalance.toFixed(2)}, Farq: $${difference.toFixed(2)})`,
                        dbBalance: dbBalance,
                        calculatedBalance: calculatedBalance,
                        difference: difference
                    };
                }
                
                return {
                    valid: true,
                    balance: dbBalance,
                    totalSales: totalSales,
                    totalHandovers: totalHandovers
                };
                
            } catch (error) {
                console.error('Balans tekshirishda xato:', error);
                return {
                    valid: false,
                    error: '❌ Balans tekshirishda xato!'
                };
            }
        },
        
        // Duplicate savdo tekshiruvi
        async checkDuplicateSale(saleData) {
            try {
                const response = await fetch(`/api/cashier-sales?cashierId=${saleData.cashierId}`);
                const data = await response.json();
                
                if (!data.success) return { valid: true };
                
                // Oxirgi 5 daqiqada bir xil savdo bormi?
                const now = Date.now();
                const fiveMinutesAgo = now - (5 * 60 * 1000);
                
                const recentSales = data.sales.filter(sale => {
                    const saleTime = new Date(sale.createdAt).getTime();
                    return saleTime > fiveMinutesAgo;
                });
                
                const duplicate = recentSales.find(sale => 
                    sale.product === saleData.product &&
                    sale.price === saleData.price &&
                    sale.paid === saleData.paid
                );
                
                if (duplicate) {
                    return {
                        valid: false,
                        error: '❌ Bu savdo oxirgi 5 daqiqada qilingan! Duplicate bo\'lishi mumkin.',
                        duplicate: duplicate
                    };
                }
                
                return { valid: true };
                
            } catch (error) {
                console.error('Duplicate tekshirishda xato:', error);
                return { valid: true }; // Xato bo'lsa, davom etsin
            }
        },
        
        // Kirim berish validatsiyasi
        async validateHandover(handoverData) {
            const errors = [];
            
            // 1. Kassir ID majburiy
            if (!handoverData.cashierId) {
                errors.push('❌ Kassir ID yo\'q!');
            }
            
            // 2. Summa majburiy va musbat
            if (!handoverData.amount || handoverData.amount <= 0) {
                errors.push('❌ Summa noto\'g\'ri!');
            }
            
            // 3. Kassir balansi yetarlimi?
            try {
                const response = await fetch(`/api/cashiers/${handoverData.cashierId}`);
                const data = await response.json();
                
                if (data.success && data.cashier) {
                    const balance = data.cashier.balance || 0;
                    
                    if (handoverData.amount > balance) {
                        errors.push(`❌ Balansda yetarli pul yo'q! (Balans: $${balance.toFixed(2)})`);
                    }
                }
            } catch (error) {
                console.error('Balans tekshirishda xato:', error);
            }
            
            return {
                valid: errors.length === 0,
                errors: errors
            };
        },
        
        // Hisobot validatsiyasi
        validateReport(reportData) {
            const errors = [];
            
            // 1. Sana majburiy
            if (!reportData.startDate || !reportData.endDate) {
                errors.push('❌ Sana tanlanmagan!');
            }
            
            // 2. Boshlanish sanasi tugash sanasidan katta bo'lmasligi kerak
            if (reportData.startDate && reportData.endDate) {
                const start = new Date(reportData.startDate);
                const end = new Date(reportData.endDate);
                
                if (start > end) {
                    errors.push('❌ Boshlanish sanasi tugash sanasidan katta!');
                }
            }
            
            return {
                valid: errors.length === 0,
                errors: errors
            };
        },
        
        // Xato xabarini ko'rsatish
        showError(message) {
            alert(message);
            console.error('Validatsiya xatosi:', message);
        },
        
        // Ogohlantirish xabarini ko'rsatish
        showWarning(message) {
            if (confirm(message + '\n\nDavom etasizmi?')) {
                return true;
            }
            return false;
        },
        
        // Barcha xatolarni ko'rsatish
        showErrors(errors) {
            if (errors.length > 0) {
                const message = errors.join('\n');
                this.showError(message);
            }
        },
        
        // Barcha ogohlantirishlarni ko'rsatish
        showWarnings(warnings) {
            if (warnings.length > 0) {
                const message = warnings.join('\n');
                return this.showWarning(message);
            }
            return true;
        }
    };
    
    console.log('✅ Savdo validatsiya yuklandi');
})();
