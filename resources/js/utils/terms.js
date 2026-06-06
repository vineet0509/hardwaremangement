export const getTermsAndConditions = (businessType) => {
    switch (businessType) {
        case 'Hardware / Building Materials':
            return "Goods once sold will not be taken back or exchanged. Warranty/Guarantee claims are subject to manufacturer terms. Material must be checked at the time of delivery.";
        case 'Electronics / Mobile Shop':
            return "Goods once sold are non-refundable. Warranty claims must be handled directly with the authorized service center. Physical damage voids all warranties.";
        case 'Grocery / Supermarket':
            return "Please check the expiry date before purchasing. Consumable items are non-returnable. Exchanges (if applicable) only within 3 days with original bill.";
        case 'Clothing / Garments':
            return "No refund on sold goods. Exchange possible within 7 days with original tag and bill. Altered or washed garments cannot be exchanged.";
        case 'Services / General':
        default:
            return "Payment is due upon receipt of invoice. Advance payments are non-refundable. Thank you for your business!";
    }
};
