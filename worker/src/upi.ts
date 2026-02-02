export async function sendUpi(to: string, amount: string) {
    console.log(`creating payment session for ${to}...`);
    await new Promise(r => setTimeout(r, 2000)); 
    
    console.log(`sent ₹${amount} to ${to} via upi`);
    return { status: "success", transactionId: "txn_" + Date.now() };
}