import { useState } from 'react'
import api from '../services/api'

export default function Subscribe() {
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [message, setMessage] = useState('')

  const pay = async () => {
    try {
      const { data } = await api.post('/payments/subscribe', { amount: 99, payment_method: paymentMethod, simulate_failure: simulateFailure })
      setMessage(data.message)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment failed')
    }
  }

  return (
    <div className="form-wrap">
      <div className="card form-card">
        <h2>Premium subscription</h2>
        <p>Monthly fee: ₹99</p>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
        </select>
        <label><input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} /> Simulate payment failure</label>
        <button onClick={pay}>Pay now</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  )
}