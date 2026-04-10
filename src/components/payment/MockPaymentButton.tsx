import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MockPaymentButtonProps {
  orderId: number;
  amount: number;
}

export const MockPaymentButton = ({ orderId, amount }: MockPaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMockPayment = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Step 1: Create mock payment order
      toast.info('Processing payment...');
      
      const createResponse = await fetch('/api/payment/mock/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_id: orderId })
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        toast.error(createData.message || 'Failed to create payment');
        setLoading(false);
        return;
      }

      // Step 2: Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Verify payment
      const verifyResponse = await fetch('/api/payment/mock/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          payment_id: createData.data.order_id 
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        toast.success('Payment Successful! 🎉');
        setTimeout(() => navigate('/orders'), 1000);
      } else {
        toast.error(verifyData.message || 'Payment verification failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mock-payment-container p-6 bg-white rounded-lg shadow-lg">
      <div className="payment-summary mb-6">
        <h3 className="text-xl font-semibold mb-4">Payment Summary</h3>
        <div className="flex justify-between mb-2">
          <span>Order ID:</span>
          <span className="font-medium">#{orderId}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Total Amount:</span>
          <span className="font-bold text-lg">₹{amount.toFixed(2)}</span>
        </div>
      </div>

      <button 
        onClick={handleMockPayment}
        disabled={loading}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white
          transition-all duration-300
          ${loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }
        `}
      >
        {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)} (Demo)`}
      </button>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          🎓 <strong>Demo Mode:</strong> Payment will be automatically successful
        </p>
      </div>
    </div>
  );
};
