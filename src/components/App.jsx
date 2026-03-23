import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import SelectTown from './SelectTown.jsx'
import styles from '../styles/App.module.scss'
import { findCityById } from './geoTraversal';

export default function App() {
  const [modalShown, setModalShown] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [geoData, setGeoData] = useState(null);

      useEffect(() => {
        async function getData() {
            try {
                const response = await fetch('/geo.json');
                const result = await response.json();
                setGeoData(result)
               
            } catch (err) {
                console.log(`Ошибка загрузки данных ${err}`)
            }
        }
        getData();
    }, [])

  useEffect(() => {
    const cityId = Cookies.get('cityId')
    if (cityId && geoData) {
      const found = findCityById(geoData, parseInt(cityId))
      if (found) {
        setSelectedCity({ id: found.node.id, name: found.node.name })
      }
    }
  }, [geoData])

  function handleSelectTownBtn() {
    setModalShown(true);
  }

  function handleCity(city) {
    setSelectedCity({ id: city.id, name: city.name });
    Cookies.set('cityId', city.id, { expires: 180})
    setModalShown(false);
  }

  function handleData(data) {
      setGeoData(data)
  }

  return (
    <>
      <div className={styles.container}>
        <button className={styles.button} type="button" onClick={handleSelectTownBtn}>Выбрать город</button>
        <p className={styles.city}>{selectedCity?.name || 'Город не выбран'}</p>
      </div>


      {modalShown && <SelectTown onHandleCity={handleCity} geoData ={geoData}
      selectedCityId={selectedCity?.id}
      />}
    </>
  )
}