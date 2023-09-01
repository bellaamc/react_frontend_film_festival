import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Films from './components/Films';
import Film from './components/Film';
import NotFound from './components/NotFound';
import RegisterUser from './components/registerUser';
import LoginUser from './components/loginUser';
import StartingPage from './components/StartingPage';
import CreateFilm from './components/CreateFilm'
import ViewMyFilms from "./components/ViewMyFilms";
import Profile from './components/Profile'
import EditFilm from './components/EditFilm'
import ReviewFilm from './components/AddReview'
import EditProfile from './components/EditProfile'

function App() {
    return (
        <div className="App">
            <Router>
                <div>
                    <Routes>
                        <Route path="/films" element={<Films />} />
                        <Route path="/films/:id" element={<Film />} />
                        <Route path="/users/login"element={<LoginUser />}/>
                        <Route path="/users/register" element={<RegisterUser />} />
                        <Route path="/users/profile" element={<Profile />} />
                        <Route path="/films/create" element={<CreateFilm />} />
                        <Route path="/films/myfilms" element={<ViewMyFilms />} />
                        <Route path="/films/edit/:id" element={<EditFilm />} />
                        <Route path="/films/makeReview/:id" element={<ReviewFilm />} />
                        <Route path="/users/edit/:id" element={<EditProfile />} />
                        <Route path="" element={<StartingPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;