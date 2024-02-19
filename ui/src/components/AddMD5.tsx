import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || '';
const API_URL = `${BASE_URL}/api`;
const ADD_MD5_URL = `${API_URL}/add-md5`;

const AddMD5: React.FC = () => {
  const [md5, setMd5] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(ADD_MD5_URL, { md5, comment });
      setMd5('');
      setComment('');
      alert('MD5 added successfully');
    } catch (error) {
      console.error('Error adding MD5:', error);
      alert('Failed to add MD5');
    }
  };

  return (
    <div>
      <h2>Add a Blocked MD5</h2>
      <form onSubmit={handleSubmit}>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">MD5</span>
          </div>
          <input
            type="text"
            className="input input-bordered w-full max-w-xs"
            value={md5}
            onChange={(e) => setMd5(e.target.value)}
            placeholder="Enter MD5"
            required
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Comment</span>
          </div>
          <textarea
            className="textarea textarea-bordered textarea-lg w-full max-w-xs"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter comment"
          />
        </label>
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
    </div>
  );
}

export default AddMD5;