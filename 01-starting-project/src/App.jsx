import { useRef, useState, useCallback ,useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { UpdateUsersPlaces ,fetchUserPlaces } from './components/http.js';
import Error from './components/Error.jsx';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [isFetching,setisFetching] = useState(false);
  const [error,seterror] = useState();

  const [errorUserPlaces, seterrorUserPlaces ] = useState();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(()=>{
    async function fetchPlaces() {
      setisFetching(true);
      try {
    //fetching data from backend using fetchUserPlaces in http.js and store them in place variable
         const places = await fetchUserPlaces();
         setUserPlaces(places);

  } catch (error){
    seterror({message : error.message || "Unable to Fetch user Data!!"});
  }
  setisFetching(false);
    }
    fetchPlaces();
  },[]);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      
      await UpdateUsersPlaces([selectedPlace,...userPlaces]);

    } catch (error) {
      setUserPlaces(userPlaces);
      seterrorUserPlaces({message : error.message || 'failed to update places'})
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try {
      await UpdateUsersPlaces(
        userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      );
    } catch (error) {
      setUserPlaces(userPlaces);
      seterrorUserPlaces({message : error.message || 'failed to delete places'})
    }
    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError (){
    seterrorUserPlaces(null)
  }

  return (
    <>
    <Modal open={errorUserPlaces} onClose={handleError}>
  {errorUserPlaces &&  (<Error 
      title="An Error Occurred!!!"
      message={errorUserPlaces.message}
      onConfirm={handleError}
      />)}
    </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title='An Error Occurred!' message={error.message} />}
       {! error && <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          isLoading={isFetching}
          loadingText='Fetching your places...'
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
