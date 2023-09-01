import axios from 'axios';
import React from "react";
import {useNavigate, useParams} from 'react-router-dom';
import '@fontsource/montserrat/400.css';
import {
    Alert,
    AlertTitle,
    Grid,
    Accordion,
    Card,
    Paper,
    useTheme,
    ThemeProvider,
    CssBaseline,
    Rating,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    CardActionArea,
    Button, AppBar, Toolbar, IconButton, Menu, MenuItem
} from "@mui/material";
import Typography from "@mui/material/Typography";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import MenuIcon from "@mui/icons-material/Menu";
import userStore from "../store";

const Film = () => {
    const baseUrl = 'http://localhost:4941/api/v1/films';
    const theme = useTheme()
    const {id} = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = React.useState<Array<Review>>([])
    const [film, setFilm] = React.useState<Film>({
        filmId: 0, title: "", directorId: 0, directorFirstName: "", description: "",
        directorLastName: "", ageRating: "", genreId: 0, rating: 0, releaseDate: "", runtime: 0
    })
    const [similarGenres, setSimilarGenres] = React.useState<Array<Film>>([])
    const [similarDirectors, setSimilarDirectors] = React.useState<Array<Film>>([])
    const firstSimilarCall = [
        ...similarGenres.filter((genreMovie) => genreMovie.genreId === film.genreId),
        ...similarDirectors.filter((directorMovie) => directorMovie.directorId === film.directorId),
    ];
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const similarMovies = firstSimilarCall.filter((movie, index, self) => {
        return (
            index === self.findIndex((m) => (
                m.filmId === movie.filmId
            )) && movie.filmId !== film.filmId
        );
    });
    const [genres, setGenres] = React.useState<Array<Genre>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const currentUserToken = userStore((state) => state.token)
    const loggingInToken = userStore((state) => state.setToken)
    const loggingInUser = userStore((state) => state.setLoggedInUser)
    const genreParams = new URLSearchParams();
    const directorParams = new URLSearchParams();

    React.useEffect(() => {
        const getFilm = () => {
            axios.get('http://localhost:4941/api/v1/films/' + id)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setFilm(response.data)
                    genreParams.set('genreIds', response.data.genreId)
                    directorParams.set('directorId', response.data.directorId)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getFilm()
        getGenres()
        getReviews()
        getSimilarGenreMovies()
        getSimilarDirectorMovies()
    }, [])

    const getGenres = () => {
        axios.get('http://localhost:4941/api/v1/films/genres')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setGenres(response.data)
            })
            .catch((error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getSimilarGenreMovies = () => {
        console.log('done')
        axios.get(`${baseUrl}?${genreParams.toString()}`)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSimilarGenres(response.data.films)
            })
            .catch((error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getSimilarDirectorMovies = () => {
        axios.get(`${baseUrl}?${directorParams.toString()}`)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSimilarDirectors(response.data.films)
            })
            .catch((error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getReviews = () => {
        axios.get('http://localhost:4941/api/v1/films/'+ id +'/reviews')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setReviews(response.data)
            })
            .catch((error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }
    const mapGenres = (filmGenre: number) => {
        const genre = genres.find((g) => g.genreId === filmGenre);
        return genre ? genre.name : "";
    }


        const displayCardContents = (film: Film, reviewsNum: number) => {
            return (
                <Typography variant="body1" color="text.primary" fontFamily="montserrat" align="left" style={{ marginBottom: "8px" }}>
                    <p>Genre: {mapGenres(film.genreId)}</p>
                    <p>
                        Director: {film.directorFirstName} {film.directorLastName}
                    </p>
                    <p>Age Rating: {film.ageRating}</p>
                    <p>
                        Release Date:{" "}
                        {new Date(film.releaseDate).toLocaleDateString()}
                    </p>
                    <p>Rating:<Rating name="read-only" value={Number(film.rating)/2} precision={0.5} readOnly /> </p>
                    <p>Number of reviews: {reviewsNum} </p>
                    {descriptionAccordion()}
                    {reviewsAccordion()}
                    {similarMoviesAccordion()}
                    {reviewButton(film)}
                </Typography>)
        }
        const reviewsAccordion = () => {
            return (
            <Accordion >
                <AccordionSummary>
                    <Typography>Reviews</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {reviewCards()}
                </AccordionDetails>
            </Accordion>
        )
    }
    const descriptionAccordion = () => {
        return (
            <Accordion >
                <AccordionSummary>
                    <Typography>Description</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {film.description}
                </AccordionDetails>
            </Accordion>
        )
    }

    const reviewCards = () => {
        return (
            <Card>
                <CardContent>
                    {reviews.map((review, index) => {
                        return (
                            <div key={`${review.reviewerId}-${index}`} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                <Avatar src={`http://localhost:4941/api/v1/users/${review.reviewerId}/image`} />
                                <div style={{ marginLeft: "10px" }}>
                                    <p>{review.reviewerFirstName} {review.reviewerLastName}</p>
                                    <p>
                                        Rating: <Rating name="read-only" value={Number(review.rating) / 2} precision={0.5} readOnly />
                                    </p>
                                    <Typography variant="body1" color="text.primary" fontFamily="montserrat" align="left">
                                        {review.review != null && <p>Review: {review.review}</p>}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        );
    };

    const handleClick = (film: Film) => {
        navigate(`/films/${film.filmId}`);
        window.location.reload();
    };

    const handleReviewOpen = (film: Film) => {
        navigate(`/films/makeReview/${film.filmId}`);
        window.location.reload();
    };

    const similarMoviesAccordion = () => {
        return (
            <Accordion>
                <AccordionSummary>
                    <Typography>Similar Movies</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {similarMovies.map((movie) => (
                            <Grid item xs={12} sm={6} md={4} key={movie.filmId}>
                                <Card>
                                    <CardActionArea onClick={() => handleClick(movie)}>
                                        <CardMedia
                                            component="img"
                                            height="400"
                                            image={`http://localhost:4941/api/v1/films/${movie.filmId}/image`}
                                            alt={`${movie.title} image`}
                                        />
                                        <CardContent>
                                            <Typography variant="body2" color="text.secondary">
                                                <p>Film: {movie.title}</p>
                                                <p>Genre: {mapGenres(movie.genreId)}</p>
                                                <p>
                                                    Director: {movie.directorFirstName} {movie.directorLastName}
                                                </p>
                                                <p>Rating: {movie.rating}/10</p>
                                                <p>Age Rating: {movie.ageRating}</p>
                                                <p>Release Date: {new Date(movie.releaseDate).toLocaleDateString()}</p>
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        );
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleViewFilms = () => {
        navigate('/films');
        handleMenuClose();
    }

    const handleCreateFilm = () => {
        navigate('/films/create');
        handleMenuClose();
    }

    const handleProfile = () => {
        navigate('/users/profile');
        handleMenuClose();
    }
    const handleLogout = async () => {
        try {
            const headers = {
                'X-Authorization': currentUserToken
            };

            await axios.post('http://localhost:4941/api/v1/users/logout', null, {
                headers: headers
            });
            loggingInUser(0);
            loggingInToken('');
            navigate('/');
            setErrorFlag(false);
            setErrorMessage('');
        } catch (error: any) {
            // Handle logout error
            if (error.response && error.response.status === 401) {
                setErrorFlag(true);
                setErrorMessage('Unauthorized. Cannot log out if you are not authenticated');
            } else {
                setErrorFlag(true);
                setErrorMessage('Cannot logout without being logged in first.');
            }
        }
    };

    const handleLogin = () => {
        navigate('/users/login');
        handleMenuClose();
    }

    const handleViewAllFilms = () => {
        navigate('/films');
        handleMenuClose();
    }

    const reviewButton = (film: Film) => {
        if (currentUserToken !== "") {
            return (<Button variant="contained" onClick={(e) => handleReviewOpen(film)} sx={{
                    m: 1,
                    minWidth: 120,
                    borderRadius: '4px',
                }}>Add Review</Button>
            )
        }
    }

    const profileMenu = () => {
        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={handleMenuOpen}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            {currentUserToken !== "" ? (
                                <>
                                    <MenuItem onClick={handleProfile} value="profile">Profile</MenuItem>
                                    <MenuItem onClick={handleLogout} value="logout">Logout</MenuItem>
                                    <MenuItem onClick={handleCreateFilm} value="createFilm">Create Film</MenuItem>
                                    <MenuItem onClick={handleViewFilms} value="viewFilm">View My Films</MenuItem>
                                </>
                            ) : (
                                <>
                                    <MenuItem onClick={handleLogin} value="login">Login</MenuItem>
                                    <MenuItem onClick={handleViewAllFilms} value="viewFilm">View Films</MenuItem>
                                </>
                            )}
                        </Menu>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Fun Films!
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
        );
    };

        return (
            <div>
                {profileMenu()}
                <div>
                    {errorFlag && (
                        <Alert severity="error">
                            <AlertTitle>Error</AlertTitle>
                            {errorMessage}
                        </Alert>
                    )}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                        <Paper elevation={4} style={{ padding: "10px", margin: "20px", width: "1700px" }}>
                            <ThemeProvider theme={theme}>
                                <CssBaseline />
                                <Typography variant="h5" fontFamily="montserrat" align="left">
                                    Review:
                                </Typography>
                                <Typography gutterBottom variant="h2" fontFamily="montserrat" component="div" align="left">
                                    {film.title}
                                </Typography>
                            </ThemeProvider>
                            <Card>
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                                    <CardMedia
                                        component="img"
                                        height="800"
                                        image={`http://localhost:4941/api/v1/films/${film.filmId}/image`}
                                        alt={`${film.title} image`}
                                    />
                                    <CardContent>
                                        {displayCardContents(film, reviews.length)}
                                    </CardContent>
                                </div>
                            </Card>
                        </Paper>
                    </div>
                </div>
            </div>
        )
    }
export default Film;
