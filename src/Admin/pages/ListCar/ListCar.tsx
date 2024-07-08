import React, { useState, useEffect } from 'react';
import './ListCar.css';
import { format } from 'date-fns';

const ListCar: React.FC = () => {
  //@ts-expect-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cars, setCars] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsLoggedIn] = useState<boolean>(false); // State untuk status autentikasi
  const [token, setToken] = useState<string>(''); // State untuk menyimpan token JWT

  useEffect(() => {
    // Fungsi untuk memeriksa status autentikasi
    const checkAuthStatus = async () => {
      // Lakukan pemeriksaan autentikasi di sini, misalnya dengan memeriksa localStorage atau cookie
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // Set status autentikasi dan token
        setIsLoggedIn(true);
        setToken(storedToken);
        console.log('Token found:', storedToken);
      } else {
        setIsLoggedIn(false);
        setToken('');
        console.log('No token found');
      }
    };

    checkAuthStatus();
  }, []);

  // Handle filter button click
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleDeleteClick = async (carId: number) => {
    if (!token) {
      setError('No token available for authentication');
      return;
    }
    try {
      const response = await fetch(`https://backend-bcr-production.up.railway.app/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete car: ${response.statusText}`);
      }

      // Remove the deleted car from the state
      //@ts-expect-ignore
      setCars((prevCars) => prevCars.filter((car) => car.id !== carId));
    } catch (error) {
      //@ts-expect-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((error as any).message || 'Failed to delete car');
      console.error('Error deleting car:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No token available for authentication');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('https://backend-bcr-production.up.railway.app/cars/all', {
          headers: {
            Authorization: `Bearer ${token}`, // Menggunakan token untuk otentikasi
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const result = await response.json();
        const { cars } = result; // Destructuring untuk mendapatkan array `cars`
        console.log('Fetched cars:', cars);

        if (!Array.isArray(cars)) {
          throw new Error('Fetched data is not an array');
        }

        setCars(cars);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        //@ts-expect-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((error as any).message || 'Failed to fetch data');
        console.error('Error fetching data:', error);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);
  //
  const filteredCars =
    activeFilter === 'All'
      ? cars //@ts-expect-ignore
      : cars.filter((car) => car.category.toLowerCase() === activeFilter.toLowerCase());

  if (loading) {
    return <div className="SectionViewCars">Loading...</div>;
  }

  if (error) {
    return <div className="SectionViewCars">Error: {error}</div>;
  }

  return (
    <div className="SectionListCars">
      <div className="ListCar">
        <div className="ListCarText">
          <strong>List Car</strong>
        </div>
        <button className="button-add-new">Add New Car</button>
      </div>
      <div className="filter-button">
        <button className={`buttonfilter ${activeFilter === 'All' ? 'active' : 'disabled'}`} onClick={() => handleFilterClick('All')}>
          All
        </button>
        <button className={`buttonfilter ${activeFilter === 'small' ? 'active' : 'disabled'}`} onClick={() => handleFilterClick('small')}>
          Small
        </button>
        <button className={`buttonfilter ${activeFilter === 'medium' ? 'active' : 'disabled'}`} onClick={() => handleFilterClick('medium')}>
          Medium
        </button>
        <button className={`buttonfilter ${activeFilter === 'large' ? 'active' : 'disabled'}`} onClick={() => handleFilterClick('large')}>
          Large
        </button>
      </div>
      <div className="SectionViewCars">
        {filteredCars.map((car) => (
          //@ts-expect-ignore
          <div key={car.id} className="HeadCardCar">
            <img className="img-car" src={car.image} alt={car.name} />
            <div className="BodyCardCar">
              <p className="body-14-reguler">{car.name}</p>
              <p className="title-16-bold">Rp. {car.price} / hari</p>
              <div className="desc-card">
                <p className="body-14-light">
                  {format(new Date(car.start_date), 'dd/MM/yyyy')} - {format(new Date(car.end_date), 'dd/MM/yyyy')}
                </p>
              </div>
              <div className="desc-card">
                <p className="body-14-light">Updated at {format(new Date(car.updatedAt), 'dd/MM/yyyy, HH:mm')}</p>
              </div>
              <div className="button-card">
                <button className="delete-button body-14-bold" onClick={() => handleDeleteClick(car.id)}>
                  Delete
                </button>
                <button className="edit-button body-14-bold">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListCar;
