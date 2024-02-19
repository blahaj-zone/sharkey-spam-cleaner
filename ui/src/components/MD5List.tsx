import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MD5 } from '../types';

const BASE_URL = process.env.REACT_APP_BASE_URL || '';
const API_URL = `${BASE_URL}/api`;
const REMOVE_MD5_URL = `${API_URL}/remove-md5`;
const BLOCKED_MD5_URL = `${API_URL}/blocked-md5s`;

const MD5List: React.FC = () => {
  const [md5s, setMd5s] = useState<MD5[]>([]);

  useEffect(() => {
    fetchMD5s();
  }, []);

  const fetchMD5s = async () => {
    try {
      const response = await axios.get<MD5[]>(BLOCKED_MD5_URL);
      setMd5s(response.data);
    } catch (error) {
      console.error('Error fetching MD5s:', error);
    }
  };

  const deleteMD5 = async (md5: string) => {
    try {
      await axios.delete(`${REMOVE_MD5_URL}/${md5}`);
      fetchMD5s(); // Refresh the list
    } catch (error) {
      console.error('Error deleting MD5:', error);
    }
  };

  return (
    <div>
      <h2>Blocked MD5s</h2>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th style={{width: 360}}>MD5</th>
              <th>Comment</th>
              <th style={{width: 180}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {md5s.map((item) => (
              <tr>
                <th>{item.md5}</th>
                <td>{item.comment || <i>No comment</i>}</td>
                <td>
                  <button
                    className="btn"
                    onClick={() => deleteMD5(item.md5)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 30 30" style={{fill: 'white'}}>
                      <path d="M6 8v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8H6zM24 4h-6c0-.6-.4-1-1-1h-4c-.6 0-1 .4-1 1H6C5.4 4 5 4.4 5 5s.4 1 1 1h18c.6 0 1-.4 1-1S24.6 4 24 4z"></path>
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MD5List;