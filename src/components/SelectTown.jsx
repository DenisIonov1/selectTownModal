import { useEffect, useState } from 'react';
import { geoTraversal, findCityById } from './geoTraversal';
import styles from '../styles/SelectTown.module.scss'

export default function SelectTown({ onHandleCity, geoData, selectedCityId }) {
    const [districts, setDistrict] = useState([]);
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);

    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSearchDistrict, setSelectedSearchDistrict] = useState(null);
    const [selectedSearchRegion, setSelectedSearchRegion] = useState(null);

    const [activeDistrictId, setActiveDistrictId] = useState(null);
    const [activeRegionId, setActiveRegionId] = useState(null);
    const [activeCityId, setActiveCityId] = useState(null);

    const districtsToRender = getDistrictsFromSearch();
    const regionsToRender = getRegionsFromSearch();
    const citiesToRender = getCitiesFromSearch();

    const topCities = [...cities].sort((a, b) => b.count - a.count).slice(0, 3);

    useEffect(() => {
        if (geoData) {
            const country = geoData.find(elem => elem.type === 'country' && elem.name === 'Россия');
            if (country) {
                setDistrict(country.children);
            }
        }
    }, [geoData]);

    useEffect(() => {
        if (selectedCityId && districts.length > 0) {
            restoreSelectedPath(districts, selectedCityId)
        }
    }, [selectedCityId, districts])

    function restoreSelectedPath(nodes, cityId) {
        const found = findCityById(nodes, cityId);

        if (found) {
            setActiveDistrictId(found.districtId);
            setActiveRegionId(found.regionId);
            setActiveCityId(found.node.id);

            if (found.district && found.district.children) {
                setRegions(found.district.children);
            }

            if (found.region && found.region.children) {
                setCities(found.region.children);
            }
        }
    }

    function handleDistrict(district) {
        if (!district.children || district.children.length === 0) {
            onHandleCity(district)
            return
        }
        setRegions(district.children || []);
        setCities([]);
        setActiveDistrictId(district.id);
        setActiveRegionId(null);
    }

    function handleRegions(region) {
        if (!region.children || region.children.length === 0) {
            onHandleCity(region)
            return
        }
        setCities(region.children || []);
        setActiveRegionId(region.id)
    }

    function handleCity(city) {
        setActiveCityId(city.id);
        onHandleCity(city);
    }

    function handleSearchDistrict(district) {
        setSelectedSearchDistrict(district.id);
        setSelectedSearchRegion(null);
    }

    function handleSearchRegion(region) {
        setSelectedSearchRegion(region.id);
    }

    function searchCities(e) {
        const value = e.target.value.toLowerCase();

        setIsSearching(value.trim() !== '');

        if (value.trim() === '') {
            setSearchResults([]);
            return;
        }

        let allResults = [];

        districts.forEach((el) => {
            const results = geoTraversal(el, value)
            allResults = [...allResults, ...results]
        })
        setSearchResults(allResults)
    }

    function getDistrictsFromSearch() {
        const uniqueDistricts = new Map();
        searchResults.forEach(el => {
            const district = el.district
            if (!uniqueDistricts.has(district.id)) {
                uniqueDistricts.set(district.id, district)
            }
        })
        return Array.from(uniqueDistricts.values())
    }

    function getRegionsFromSearch() {
        const uniqueRegions = new Map();
        searchResults.forEach(el => {
            const region = el.region;
            if (!uniqueRegions.has(region.id) && (selectedSearchDistrict === null || el.district.id === selectedSearchDistrict)) {
                uniqueRegions.set(region.id, region)
            }
        })
        return Array.from(uniqueRegions.values())
    }

    function getCitiesFromSearch() {
        return searchResults.filter((elem =>
            (selectedSearchRegion === null || elem.region.id === selectedSearchRegion) &&
            (selectedSearchDistrict === null || elem.district.id === selectedSearchDistrict)
        )).sort((a, b) => {
            return a.city.name.localeCompare(b.city.name)
        })
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <nav className={styles.modalNav}>
                    <p className={styles.navText}>Выбор города</p>
                    <form >
                        <div className={styles.searchWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3134 14.173L6.70938 17.777C6.30938 18.175 5.68438 18.167 5.29338 17.777C4.90038 17.385 4.90338 16.753 5.29538 16.362L8.89938 12.757C7.61338 10.817 7.82538 8.175 9.53638 6.464C11.4884 4.512 14.6544 4.512 16.6064 6.464C18.5594 8.417 18.5594 11.584 16.6064 13.534C14.8964 15.246 12.2564 15.459 10.3134 14.173ZM10.9504 12.123C9.77738 10.95 9.77738 9.051 10.9504 7.879C12.1204 6.709 14.0204 6.709 15.1904 7.879C16.3634 9.052 16.3634 10.951 15.1904 12.123C14.0204 13.295 12.1204 13.295 10.9504 12.123Z" fill="#999999" />
                            </svg>

                            <input
                                type="text"
                                placeholder='Название города'
                                onChange={searchCities}
                                className={styles.searchInput}
                            />
                        </div>

                    </form>
                </nav>

                <div className={styles.columns}>
                    {isSearching ?
                        <>
                            <ul className={styles.federalDistrict}>
                                {districtsToRender.map(elem => {
                                    return <li key={elem.id}>
                                        <button
                                            className={styles.districtBtn}
                                            type='button'
                                            onClick={() => { handleSearchDistrict(elem) }}
                                        >
                                            {elem.name}
                                        </button>
                                    </li>
                                })
                                }
                            </ul>

                            <ul className={styles.region}>
                                {regionsToRender.map(elem => {
                                    return <li key={elem.id}>
                                        <button
                                            className={styles.regionBtn}
                                            type='button'
                                            onClick={() => { handleSearchRegion(elem) }}
                                        >
                                            {elem.name}
                                        </button>
                                    </li>
                                })}
                            </ul>

                            <ul className={styles.citiesSearch}>
                                {citiesToRender
                                    .map(elem => {

                                        return <li key={elem.city.id}>

                                            <button
                                                className={`${styles.cityBtn} ${elem.count > 30000 ? styles.bold : ''}`}
                                                type='button'
                                                onClick={() => handleCity(elem.city)}
                                            >
                                                {elem.city.name}
                                            </button>
                                        </li>
                                    })}
                            </ul>

                        </> : <>
                            <ul className={styles.federalDistrict}>
                                {districts.map(elem => {
                                    return <li key={elem.id} className={styles.district}>
                                        <button
                                            className={`${styles.districtBtn} ${activeDistrictId === elem.id ? styles.active : ''}`}
                                            type='button'
                                            onClick={() => handleDistrict(elem)}
                                        >
                                            {elem.name}
                                        </button>
                                    </li>
                                })
                                }
                            </ul>

                            <ul className={styles.region}>
                                {regions.map(elem => {
                                    return <li key={elem.id}>
                                        <button
                                            className={`${styles.regionBtn} ${activeRegionId === elem.id ? styles.active : ''}`}
                                            onClick={() => handleRegions(elem)}
                                            type='button'
                                        >
                                            {elem.name}
                                        </button>
                                    </li>
                                })}
                            </ul>


                            <div className={styles.cities}>
                                {cities.length > 3 &&
                                    <ul className={styles.topCities}>
                                        {topCities.map((elem) => {
                                            return <li key={elem.id}>
                                                <button
                                                    className={styles.topCitiesBtn}
                                                    type='button'
                                                    onClick={() => handleCity(elem)}
                                                >
                                                    {elem.name}
                                                </button>

                                            </li>
                                        })}
                                    </ul>}
                                    
                                <ul className={styles.citiesList}>
                                    {[...cities]
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map((elem, index, array) => {
                                            const previousLetter = index > 0 ? array[index - 1].name[0] : null;
                                            const currentLetter = elem.name[0];
                                            const showLetter = index === 0 || previousLetter !== currentLetter;
                                            return <li key={elem.id}>
                                                <button
                                                    className={`${styles.cityBtn} ${elem.count > 30000 ? styles.bold : ''} ${activeCityId === elem.id ? styles.active : ''}`}
                                                    type='button'
                                                    onClick={() => handleCity(elem)}
                                                >
                                                    <span className={styles.cityLetter}>{showLetter ? elem.name[0] : '\u00A0'}</span>
                                                    {elem.name}
                                                </button>
                                            </li>
                                        })}
                                </ul>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    )
}