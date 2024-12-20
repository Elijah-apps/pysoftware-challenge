"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';

interface MenuItem {
  id: string;
  menu_item: string;
  href: string;
}

interface Address {
  id: number;
  first_name: string;
  last_name: string;
  street: string;
  postcode: string;
  state: string;
  country: string;
}

const HomePage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // Fetch menu items
    fetch('https://pysoftware.com/v1/menu_items')
      .then((res) => res.json())
      .then((data: MenuItem[]) => setMenuItems(data))
      .catch((err) => console.error(err));

    // Fetch total customer numbers
    fetch('https://pysoftware.com/v1/customer_numbers')
      .then((res) => res.json())
      .then((data: number) => setTotalCustomers(data))
      .catch((err) => console.error(err));

    // Fetch initial addresses
    fetchAddresses(1);
  }, []);

  const fetchAddresses = (page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(totalCustomers, start + ITEMS_PER_PAGE - 1);
    const promises: Promise<Address | undefined>[] = [];

    for (let i = start; i <= end; i++) {
      promises.push(
        fetch(`https://pysoftware.com/v1/address_inventory/${i}`)
          .then((res) => res.json())
          .catch((err) => {
            console.error(err);
            return undefined;
          })
      );
    }

    Promise.all(promises).then((results) => setAddresses(results.filter(Boolean) as Address[]));
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredAddresses = addresses.filter((address) =>
    address.street.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid px-0">
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-KyZXEAg3QhqLMpG8r+Knujsl5+5hb7x2l5xtnpwJQEEjtVfFb/c2/5A7PjVNDHnA"
        crossOrigin="anonymous"
      />
      <style jsx>{`
        body {
          background-color: #f8f9fa;
          font-family: 'Arial', sans-serif;
        }
        .navbar {
          background-color: #007bff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .navbar-brand, .nav-link {
          color: #fff !important;
        }
        .navbar-brand:hover, .nav-link:hover {
          color: #ffc107 !important;
        }
        .table-container {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-top: 20px;
        }
        .search-input {
          margin-bottom: 20px;
        }
        .btn {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .pagination-btn {
          background: #007bff;
          color: #fff;
        }
        .pagination-btn:hover {
          background: #0056b3;
          color: #fff;
        }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-light">
        <a className="navbar-brand" href="#">Pysoftware</a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.id}>
                <a className="nav-link" href={item.href}>{item.menu_item}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="table-container">
          <h2 className="text-center">Address List</h2>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by street name"
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="thead-light">
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Street</th>
                  <th>Postcode</th>
                  <th>State</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {filteredAddresses.map((address) => (
                  <tr key={address.id}>
                    <td>{address.first_name}</td>
                    <td>{address.last_name}</td>
                    <td>{address.street}</td>
                    <td>{address.postcode}</td>
                    <td>{address.state}</td>
                    <td>{address.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between">
            <button
              className="btn pagination-btn"
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
                fetchAddresses(currentPage - 1);
              }}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="btn pagination-btn"
              onClick={() => {
                setCurrentPage((prev) => prev + 1);
                fetchAddresses(currentPage + 1);
              }}
              disabled={currentPage * ITEMS_PER_PAGE >= totalCustomers}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
