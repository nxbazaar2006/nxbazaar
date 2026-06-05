export function checkDelivery(pincode: string) {
  if (!pincode) {
    return {
      success: false,
      message: "Enter pincode",
    };
  }

  if (pincode.length !== 6) {
    return {
      success: false,
      message: "Invalid pincode",
    };
  }

  if (/^\d{6}$/.test(pincode)) {
    return {
      success: true,
      message: "Delivery available across India 🚚",
      eta: "3-7 days",
    };
  }

  return {
    success: false,
    message: "Delivery not available",
  };
}
