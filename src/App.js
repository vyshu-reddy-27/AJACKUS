import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

function App() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      const formattedUsers = response.data.map((user) => ({
        id: user.id,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || '',
        email: user.email,
        department: user.company?.name || '',
      }));
      setUsers(formattedUsers);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateUser();
    } else {
      await addUser();
    }
  };

  const addUser = async () => {
    try {
      // Generate a new ID based on the highest existing ID
      const newId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  
      const newUser = {
        ...form, // Spread the form first
        id: newId, // Explicitly set the ID, ensuring it isn't overwritten
      };
  
      console.log("Generated New User:", newUser); // Debugging log
  
      setUsers([...users, newUser]); // Update the state with the new user
      resetForm();
      toast.success('User added successfully!');
    } catch (err) {
      console.error("Error adding user:", err);
      setError('Failed to add user');
    }
  };
  

  const updateUser = async () => {
    try {
      setUsers(users.map((user) => (user.id === form.id ? form : user)));
      resetForm();
      toast.success('User updated successfully!');
    } catch {
      setError('Failed to update user');
    }
  };

  const deleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
    toast.info('User deleted successfully!');
  };

  const editUser = (user) => {
    setForm(user);
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ id: '', firstName: '', lastName: '', email: '', department: '' });
    setIsEditing(false);
    setShowForm(false);
  };

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
    if (direction === 'next' && currentPage < Math.ceil(users.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginatedUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="app-container">
      <h1>User Management</h1>
      {error && <p className="error">{error}</p>}
      <button className="add-user-btn" onClick={() => setShowForm(true)}>
        +
      </button>
      <div className="user-list">
        <h2>Users</h2>
        <ul>
          {paginatedUsers.map((user) => (
            <li key={user.id}>
              <span>
                {user.id} - {user.firstName}{' '}
                {user.lastName} - {user.email} -{' '}
                {user.department}
              </span>
              <div className="action-icons">
                <i className="fas fa-edit" onClick={() => editUser(user)}></i>
                <i className="fas fa-trash" onClick={() => deleteUser(user.id)}></i>
              </div>
            </li>
          ))}
        </ul>
        <div className="pagination">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <span>{currentPage}</span>
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage === Math.ceil(users.length / usersPerPage)}
          >
            &raquo;
          </button>
        </div>
      </div>
      {showForm && (
        <div className="user-form-card">
          <button className="close-btn" onClick={resetForm}>
            &times;
          </button>
          <h2>{isEditing ? 'Edit User' : 'Add User'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleInputChange}
            />
            <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
          </form>
        </div>
      )}
      <ToastContainer position="top-center" />
    </div>
  );
}

export default App;
