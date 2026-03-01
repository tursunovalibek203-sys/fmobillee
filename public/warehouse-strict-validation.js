// Ombor Qattiq Validatsiya - Frontend
// Omborlar qo'shilib ketmasligi uchun

(function() {
    'use strict';
    
    // Global validation object
    window.WarehouseValidation = {
        
        // Mahsulot qo'shishdan oldin tekshirish
        async validateBeforeAdd(productData) {
            const errors = [];
            
            // 1. BranchId majburiy
            if (!productData.branchId && productData.branchId !== 0) {
                errors.push('❌ Filial tanlanmagan!');
            }
            
            // 2. Mahsulot nomi majburiy
            if (!productData.name || productData.name.trim() === '') {
                errors.push('❌ Mahsulot nomi kiritilmagan!');
            }
            
            // 3. Narx majburiy
            if (!productData.sellPrice || productData.sellPrice <= 0) {
                errors.push('❌ Sotish narxi noto\'g\'ri!');
            }
            
            // 4. Duplicate tekshiruvi
            try {
                const response = await fetch(`/api/products?branchId=${productData.branchId}`);
                const products = await response.json();
                
                const duplicate = products.find(p => 
                    p.name.toLowerCase() === productData.name.toLowerCase() &&
                    p.branchId === productData.branchId &&
                    p.productId !== productData.productId
                );
                
                if (duplicate) {
                    errors.push(`❌ Bu mahsulot allaqachon mavjud! (ID: ${duplicate.productId})`);
                }
            } catch (error) {
                console.error('Duplicate tekshirishda xato:', error);
            }
            
            // 5. IMEI unique tekshiruvi (agar mavjud bo'lsa)
            if (productData.imei) {
                try {
                    const response = await fetch('/api/products');
                    const allProducts = await response.json();
                    
                    const duplicateImei = allProducts.find(p => 
                        p.imei === productData.imei &&
                        p.productId !== productData.productId
                    );
                    
                    if (duplicateImei) {
                        errors.push(`❌ Bu IMEI allaqachon ishlatilgan! (${duplicateImei.name})`);
                    }
                } catch (error) {
                    console.error('IMEI tekshirishda xato:', error);
                }
            }
            
            return {
                valid: errors.length === 0,
                errors: errors
            };
        },
        
        // Mahsulot yangilashdan oldin tekshirish
        async validateBeforeUpdate(productData) {
            return await this.validateBeforeAdd(productData);
        },
        
        // BranchId tekshiruvi
        validateBranchId(branchId) {
            if (branchId === null || branchId === undefined) {
                return {
                    valid: false,
                    error: '❌ Filial ID yo\'q!'
                };
            }
            
            // BranchId 0 (umumiy) yoki musbat son bo'lishi kerak
            if (typeof branchId !== 'number' || branchId < 0) {
                return {
                    valid: false,
                    error: '❌ Filial ID noto\'g\'ri format!'
                };
            }
            
            return { valid: true };
        },
        
        // Stock tekshiruvi
        validateStock(stock, minStock) {
            if (stock < 0) {
                return {
                    valid: false,
                    error: '❌ Stock manfiy bo\'lishi mumkin emas!'
                };
            }
            
            if (stock < minStock) {
                return {
                    valid: true,
                    warning: `⚠️  Stock kam qoldi! (${stock} < ${minStock})`
                };
            }
            
            return { valid: true };
        },
        
        // Narx tekshiruvi
        validatePrice(buyPrice, sellPrice) {
            if (buyPrice < 0 || sellPrice < 0) {
                return {
                    valid: false,
                    error: '❌ Narx manfiy bo\'lishi mumkin emas!'
                };
            }
            
            if (buyPrice > sellPrice) {
                return {
                    valid: true,
                    warning: '⚠️  Sotish narxi olish narxidan kam!'
                };
            }
            
            return { valid: true };
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
        }
    };
    
    console.log('✅ Ombor validatsiya yuklandi');
})();
