let currentDiscount = 0;
let appliedPromoCode = '';
function formatVND(amount){
    const finalAmount = Math.max(0, amount);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalAmount).replace('₫', '₫').replace(/\s/g, '');
}
function updateCartTotal(){
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;
    let totalItems = 0;
    cartItems.forEach(item => {
        const unitPrice = parseInt(item.getAttribute('data-unit-price'));
        const quantityInput = item.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value) || 0;
        const itemTotalElement = item.querySelector('.subtotal-display');
        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;
        totalItems += quantity;
        itemTotalElement.textContent = formatVND(itemTotal);
    });
    const discountAmount = Math.min(subtotal, currentDiscount);
    const finalTotal = subtotal - discountAmount;
    document.getElementById('total-items-count').textContent = totalItems;
    document.getElementById('subtotal-display-summary').textContent = formatVND(subtotal);
    document.getElementById('discount-display').textContent = '- ' + formatVND(discountAmount);
    document.getElementById('final-total-display').textContent = formatVND(finalTotal);
    document.getElementById('promo-code-used').textContent = appliedPromoCode ? `(Mã ${appliedPromoCode})` : '';
}
function applyPromoCode(){
    const inputElement = document.getElementById('promo-input');
    const promoCode = inputElement.value.toUpperCase().trim();
    const validPromoCodes = {
        'SIEUGIAMGIA500K': { type: 'fixed', value: 500000, name: 'Giảm cố định 500.000₫' },
        'GIAM18%': { type: 'percent', value: 0.18, name: 'Giảm 18% trên tổng tạm tính' },
    };
    const subtotalText = document.getElementById('subtotal-display-summary').textContent;
    const currentSubtotal = parseInt(subtotalText.replace(/[.₫]/g, '').trim()) || 0;
    if(validPromoCodes[promoCode]){
        const promo = validPromoCodes[promoCode];
        let calculatedDiscount = 0;
        if(promo.type === 'percent'){
            calculatedDiscount = currentSubtotal * promo.value;
        } else if(promo.type === 'fixed'){
            calculatedDiscount = promo.value;
        }
        currentDiscount = calculatedDiscount;
        appliedPromoCode = promoCode;
        updateCartTotal();
        alert(`🎉 Áp dụng mã ${promoCode} thành công! Bạn được ${promo.name}.`);
    }else{
        currentDiscount = 0;
        appliedPromoCode = '';
        updateCartTotal();
        alert(` Mã giảm giá "${promoCode}" không hợp lệ hoặc đã hết hạn.`);
    }
}
function handleCheckout(){
    const totalItems = document.getElementById('total-items-count').textContent;
    const finalTotalText = document.getElementById('final-total-display').textContent;
    const discountText = document.getElementById('discount-display').textContent;
    const appliedCodeText = document.getElementById('promo-code-used').textContent;
    const shippingAddress = document.getElementById('shipping-address-input').value.trim(); 
    if(parseInt(totalItems) === 0){
        alert("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
        return;
    }
    if(!shippingAddress){
        alert("Vui lòng nhập địa chỉ giao hàng trước khi thanh toán.");
        document.getElementById('shipping-address-input').focus();
        return;
    }
    const deliveryAddress = shippingAddress; 
    const estimatedDelivery = 'trong vòng 3-5 ngày làm việc';
    const confirmationMessage =
        `ĐẶT HÀNG THÀNH CÔNG \n\n` +
        `Số lượng : ${totalItems}\n` +
        `Giảm giá ${appliedCodeText}: ${discountText}\n` +
        `Tổng cộng : ${finalTotalText}\n\n` +
        `Đơn hàng của bạn đã được xác nhận và sẽ được giao tới địa chỉ ${deliveryAddress} ${estimatedDelivery}. Cảm ơn bạn đã mua sắm!`;
    alert(confirmationMessage);
    const cartList = document.querySelector('.cart-items-list');
    const continueShoppingLink = document.querySelector('.continue-shopping');
    document.querySelectorAll('.cart-item').forEach(item => item.remove());
    if(!document.querySelector('.cart-items-list p')){
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Giỏ hàng của bạn đang trống.';
        emptyMessage.style.textAlign = 'center';
        cartList.insertBefore(emptyMessage, continueShoppingLink);
    }
    currentDiscount = 0;
    appliedPromoCode = '';
    document.getElementById('shipping-address-input').value = ''; 
    updateCartTotal();
}
function initCartEvents(){
    document.querySelectorAll('.cart-item').forEach(item => {
        const quantityInput = item.querySelector('.quantity-input');
        quantityInput.addEventListener('change', () => {
            let quantity = parseInt(quantityInput.value) || 1;
            if(quantity < 1 || isNaN(quantity)){
                quantity = 1;
            }
            quantityInput.value = quantity;
            updateCartTotal();
        });
        item.querySelectorAll('.quantity-btn').forEach(button =>{
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                let quantity = parseInt(quantityInput.value) || 1;
                if(action === 'plus'){
                    quantity += 1;
                }else if(action === 'minus' && quantity > 1){
                    quantity -= 1;
                }
                quantityInput.value = quantity;
                updateCartTotal();
            });
        });
    });
    document.querySelectorAll('.remove-btn').forEach(button =>{
        button.addEventListener('click', (e) => {
            const itemToRemove = e.target.closest('.cart-item');
            if (confirm(`Bạn có chắc chắn muốn xóa ${itemToRemove.querySelector('.item-info a').textContent.trim()} khỏi giỏ hàng?`)) {
                itemToRemove.remove();
                updateCartTotal();
                if (document.querySelectorAll('.cart-item').length === 0) {
                     const cartList = document.querySelector('.cart-items-list');
                     const continueShoppingLink = document.querySelector('.continue-shopping');
                     const emptyMessage = document.createElement('p');
                     emptyMessage.textContent = 'Giỏ hàng của bạn đang trống.';
                     emptyMessage.style.textAlign = 'center';
                     cartList.insertBefore(emptyMessage, continueShoppingLink);
                }
            }
        });
    });
    document.getElementById('apply-promo-btn').addEventListener('click', applyPromoCode);
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
    updateCartTotal();
}
document.addEventListener('DOMContentLoaded', initCartEvents);
