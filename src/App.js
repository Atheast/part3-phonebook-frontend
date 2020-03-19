import React, {useState, useEffect} from 'react';
import personService from './service/person';
import './app.css';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [search, setSearch] = useState('');
  const [addMessage, setAddMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChangeName = (e) => setNewName(e.target.value);
  const handleChangePhone = (e) => setNewPhone(e.target.value);

  useEffect(() => {
    personService
      .getAll()
      .then(data => {
        setPersons(data);
      });
  },[])

  const addPerson = (e) => {
    e.preventDefault();
    let repeat = persons.find(x => x.name === newName) ? true : false;
    
    if(repeat) {
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`) && newPhone !== '') {
        let p = persons.find(x => x.name === newName);
        let newObject = {...p, number: newPhone}
        personService
          .update(newObject.id,newObject)
          .then(changedPerson => {
            setPersons(persons.map(x => x.id !== changedPerson.id ? x : changedPerson))
            console.log(changedPerson);
            setNewName('');
            setNewPhone('');
          })
          .catch(() => {
            setErrorMessage(`Information of ${newObject.name} has already been removed from server`);
            setTimeout(() => setErrorMessage(''), 5000);
          })
      }
    } else {
      const newPerson = {
        name: newName,
        number: newPhone
      }

      personService
        .create(newPerson)
        .then(data => {
          setAddMessage(`Added ${data.name}`);
          setTimeout(() => setAddMessage(''), 5000);
          setPersons(persons.concat(data));
          setNewName('');
          setNewPhone('');
        })
        .catch(err => {
          setErrorMessage(err.response.data.error);
          setTimeout(() => setErrorMessage(''), 5000);
        });
    }
  }

  const handleSearch = (e) => setSearch(e.target.value);

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={addMessage}/>
      <Error message={errorMessage}/>
      <Filter search={search} handleSearch={handleSearch}/>
      <h3>add a new</h3>
      <PersonForm addPerson={addPerson} newName={newName} handleChangeName={handleChangeName} newPhone={newPhone} handleChangePhone={handleChangePhone}/>
      <h2>Numbers</h2>
      <Persons persons={persons} search={search} setPersons={setPersons}/>
    </div>
  );
}

const Notification = ({message}) => (message) ? <h2 className="added">{message}</h2> : null;

const Error = ({message}) => (message) ? <h2 className="error">{message}</h2> : null;

const Person = ({remove,name,phone,search}) => (name.includes(search) ? <p>{name} {phone} <button onClick={remove}> Delete </button></p> : '');

const Filter = ({search,handleSearch}) => (
  <div>
    filter shown with 
    <input value={search} onChange={handleSearch}/>
  </div>
)

const PersonForm = ({addPerson,newName,handleChangeName,newPhone,handleChangePhone}) => (
  <form onSubmit={addPerson}>
    <div>
      name: <input value={newName} onChange={handleChangeName}/>
    </div>
    <div>
      phone: <input value={newPhone} onChange={handleChangePhone}/>
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Persons = ({persons,search,setPersons}) => {
  let arr = persons.filter(x => x.name.includes(search));
  const removePerson = (id,name) => {
    if(window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(x => x.id !== id))
        })
    }
  }

  return(
    <div>
      {(arr.length) ? persons.map(person => <Person remove={() => removePerson(person.id,person.name)} key={person.id} id={person.id} name={person.name} phone={person.number} search={search}/>) : 'not name founds'}
    </div>
  );
}

export default App;
