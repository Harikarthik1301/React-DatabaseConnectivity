import { useEffect, useState } from 'react';
import Places from './Places.jsx';
import Error from './Error.jsx';
import {sortPlacesByDistance} from '../loc.js'
import {fetchAvailablePlaces} from './http.js'

export default function AvailablePlaces({ onSelectPlace }) {

  const [availablePlaces,setAvailablePlaces] = useState([]);
  const [isFetching,setisFetching] = useState(false);
  const [error,seterror] = useState();

  useEffect(()=>{
    setisFetching(true);
    async function fetchPlaces() {
      try {
    //fetching data from backend using fetchAvailablePlaces in http.js and store them in place variable
         const places = await fetchAvailablePlaces();

    navigator.geolocation.getCurrentPosition((position)=>{
      const sortedPlaces = sortPlacesByDistance(
        places,
        position.coords.latitude,
        position.coords.longitude,
      );
      setAvailablePlaces(sortedPlaces);
      setisFetching(false);
    })
   
  } catch (error){
    seterror({message : error.message || "Unable to Fetch Data!!"});
    setisFetching(false);
  }
    }
    fetchPlaces();
  },[]);

  if(error){
    return <Error title="An Error Occurred!!!" message={error.message}/>
  }
  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading = {isFetching}
      loadingText = "Loading places..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
