let currentDiscount = 0;
let appliedPromoCode = '';
function formatVND(amount) {
    const finalAmount = Math.max(0, amount);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalAmount).replace('₫', '₫').replace(/\s/g, '');
}
function updateCartTotal() {
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
function applyPromoCode() {
    const inputElement = document.getElementById('promo-input');
    const promoCode = inputElement.value.toUpperCase().trim();
    const validPromoCodes = {
        'SIEUGIAMGIA500K': { type: 'fixed', value: 500000, name: 'Giảm cố định 500.000₫' }, 
        'GIAM18%': { type: 'percent', value: 0.18, name: 'Giảm 18% trên tổng tạm tính' }, 
    };
    const totalElement = document.getElementById('subtotal-display-summary');
    const currentSubtotal = parseFloat(totalElement.textContent.replace(/[.₫]/g, '').trim());
    if (validPromoCodes[promoCode]) {
        const promo = validPromoCodes[promoCode];
        let calculatedDiscount = 0;
        if (promo.type === 'percent') {
            calculatedDiscount = currentSubtotal * promo.value;
        } else if (promo.type === 'fixed') {
            calculatedDiscount = promo.value;
        }
        currentDiscount = calculatedDiscount;
        appliedPromoCode = promoCode;
        updateCartTotal();
        alert(`🎉 Áp dụng mã ${promoCode} thành công! Bạn được ${promo.name}.`);
    } else {
        currentDiscount = 0;
        appliedPromoCode = '';
        updateCartTotal();
        alert(` Mã giảm giá "${promoCode}" không hợp lệ hoặc đã hết hạn.`);
    }
}
function handleCheckout() {
    const totalItems = document.getElementById('total-items-count').textContent;
    const finalTotalText = document.getElementById('final-total-display').textContent;
    const discountText = document.getElementById('discount-display').textContent;
    const appliedCodeText = document.getElementById('promo-code-used').textContent;
    if (parseInt(totalItems) === 0) {
        alert("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
        return;
    }
    const confirmationMessage = 
        `ĐẶT HÀNG THÀNH CÔNG \n\n` +
        `Số lượng : ${totalItems}\n` +
        `Giảm giá ${appliedCodeText}: ${discountText}\n` +
        `Tổng cộng : ${finalTotalText}\n\n` +
        `Đơn hàng của bạn đã được xác nhận và sẽ được giao tới địa chỉ -- trong vòng -- ngày. Cảm ơn bạn đã mua sắm!`; 

    alert(confirmationMessage);
    const cartList = document.querySelector('.cart-items-list');
    const continueShoppingLink = document.querySelector('.continue-shopping');
    document.querySelectorAll('.cart-item').forEach(item => item.remove());
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Giỏ hàng của bạn đang trống.';
    emptyMessage.style.textAlign = 'center';
    cartList.insertBefore(emptyMessage, continueShoppingLink);
    currentDiscount = 0;
    appliedPromoCode = '';
    updateCartTotal();
}
function initCartEvents() {
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', () => {
            if (parseInt(input.value) < 1 || isNaN(parseInt(input.value))) {
                input.value = 1;
            }
            updateCartTotal();
        });
    });
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemToRemove = e.target.closest('.cart-item');
            if (confirm(`Bạn có chắc chắn muốn xóa ${itemToRemove.querySelector('.item-info a').textContent.trim()} khỏi giỏ hàng?`)) {
                itemToRemove.remove();
                updateCartTotal();
            }
        });
    });
    document.getElementById('apply-promo-btn').addEventListener('click', applyPromoCode);
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
    updateCartTotal();
}
document.addEventListener('DOMContentLoaded', initCartEvents);