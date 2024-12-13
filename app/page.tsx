"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Script from 'next/script';
import Head from 'next/head';

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

  const fetchAddresses = useCallback((page: number) => {
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
  }, [totalCustomers]);

  useEffect(() => {
    // Fetch menu items
    fetch('https://pysoftware.com/v1/menu_items')
      .then((res) => res.json())
      .then((data: MenuItem[]) => setMenuItems(data))
      .catch((err) => console.error(err));

    // Fetch total customer numbers
    fetch('https://pysoftware.com/v1/customer_numbers')
      .then((res) => res.json())
      .then((data: number) => {
        setTotalCustomers(data);
        fetchAddresses(1);
      })
      .catch((err) => console.error(err));
  }, [fetchAddresses]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredAddresses = addresses.filter((address) =>
    address.street.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid px-0">
      {/* NextJS Head for managing external stylesheets */}
      <Head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          rel="stylesheet"
        />
      </Head>

      {/* Asynchronous Scripts */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"
        strategy="afterInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.min.js"
        strategy="afterInteractive"
      />
      
      {/* Custom Inline Styles */}
      <style jsx global>{`
        body {
          background-color: #f4f6f9;
          font-family: 'Inter', sans-serif;
        }
        .navbar {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
        .navbar-brand {
          color: white !important;
          font-weight: bold;
          font-size: 1.5rem;
        }
        .nav-link {
          color: rgba(255,255,255,0.8) !important;
          transition: color 0.3s ease;
        }
        .nav-link:hover {
          color: white !important;
        }
        .table-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          padding: 20px;
          margin-top: 20px;
        }
        .table {
          margin-bottom: 0;
        }
        .table thead {
          background-color: #f8f9fa;
        }
        .search-container {
          max-width: 400px;
          margin: 0 auto 20px;
        }
        .pagination-container {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark px-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <i className="fas fa-code mr-2"></i> Pysoftware
          </a>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {menuItems.map((item) => (
                <li className="nav-item" key={item.id}>
                  <a className="nav-link" href={item.href}>
                    {item.menu_item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mt-4">
        <div className="table-container">
          <h1 className="mb-4 text-center">
            <i className="fas fa-address-book mr-2"></i> Address List
          </h1>

          <div className="search-container">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="🔍 Search by street name"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
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

          {/* Pagination */}
          <div className="pagination-container">
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
                fetchAddresses(currentPage - 1);
              }}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left mr-2"></i> Previous
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setCurrentPage((prev) => prev + 1);
                fetchAddresses(currentPage + 1);
              }}
              disabled={currentPage * ITEMS_PER_PAGE >= totalCustomers}
            >
              Next <i className="fas fa-chevron-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;