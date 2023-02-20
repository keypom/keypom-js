import { useState } from 'react';
import React from 'react'

export function MyForm({
  onSubmit,
  hide
}) {
  const [accountId, setAccountId] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(accountId);
    hide();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Enter your account ID:
        <input 
          type="text" 
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />
      </label>
      <input type="submit" />
    </form>
  )
}