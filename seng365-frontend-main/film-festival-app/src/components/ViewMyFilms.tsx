import React, {useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Card from '@mui/material/Card'
import {AppBar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import {
    Alert,
    AlertTitle,
    Paper,
    CardActionArea,
    Grid,
    Toolbar,
    MenuItem,
} from "@mui/material";
import userStore from "../store";

interface Film {
    filmId: number;
    title: string;
    directorId: number;
    directorFirstName: string;
    directorLastName: string;
    description: string;
    ageRating: string;
    genreId: number;
    rating: number;
    releaseDate: string;
    runtime: number;
}

interface Genre {
    genreId: number;
    name: string;
}

const Films = () => {
    const directorParams = new URLSearchParams();
    const reviewerParams = new URLSearchParams();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);    const baseUrl = 'http://localhost:4941/api/v1/films';
    const navigate = useNavigate()
    const [directedFilms, setDirectedFilms] = React.useState<Array<Film>>([])
    const [reviewedFilms, setReviewedFilms] = React.useState<Array<Film>>([])
    const [genres, setGenres] = React.useState<Array<Genre>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const currentUserToken = userStore((state) => state.token)
    const currentUser = userStore((state) => state.loggedInUser)
    const loggingInToken = userStore((state) => state.setToken)
    const loggingInUser = userStore((state) => state.setLoggedInUser)
    const [openDialog, setOpenDialog] = useState(false);

    const getDirectedFilms = () => {
        directorParams.set("directorId", currentUser.toString());
        axios
            .get(`${baseUrl}?${directorParams.toString()}`)
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage('');
                setDirectedFilms(response.data.films);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const getReviewedFilms = () => {
        reviewerParams.set("reviewerId", currentUser.toString());
        axios
            .get(`${baseUrl}?${reviewerParams.toString()}`)
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage('');
                setReviewedFilms(response.data.films);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    React.useEffect(() => {
        getDirectedFilms();
        getReviewedFilms();
        getGenres();
    }, []);

    const handleClick = (film: Film) => {
        navigate(`/films/${film.filmId}`)
    }
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

    const handleEdit = (film: Film) => {
        navigate(`/films/edit/${film.filmId}`);
    }
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleDelete = async (film: Film) => {
        try {
            const headers = {
                'X-Authorization': currentUserToken
            };

            await axios.delete(`http://localhost:4941/api/v1/films/${film.filmId}`, {
                headers: headers
            });
            navigate('/films/myfilms');
            window.location.reload()
            setErrorFlag(false);
            setErrorMessage('');
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setErrorFlag(true);
                setErrorMessage('Unauthorized');
            } else if (error.response && error.response.status === 403) {
                setErrorFlag(true);
                setErrorMessage('Forbidden. Only the director of an film can delete it');
            } else {
                setErrorFlag(true);
                setErrorMessage('Film cannot be deleted.');
            }
        }
    };

    const handleReadMore = (film: Film) => {
        navigate(`/films/${film.filmId}`);
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
        } catch (error) {
            // Handle logout error
            setErrorFlag(true);
            setErrorMessage('Cannot logout without being logged in first.');
        }
    };

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
                            <MenuItem onClick={handleProfile} value="profile">Profile</MenuItem>
                            <MenuItem onClick={handleViewFilms} value="view-films">View Films</MenuItem>
                            <MenuItem onClick={handleLogout} value="logout">Logout</MenuItem>
                            <MenuItem onClick={handleCreateFilm} value="createFilm">Create Film</MenuItem>
                        </Menu>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Fun Films!
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
        );
    };


    const displayCardContents = (film: Film) => {
        return (
            <Typography variant="body2" color="text.secondary" style={{ marginBottom: "8px" }}>
                <p>Genre: {mapGenres(film.genreId)}</p>
                <p>
                    Director: {film.directorFirstName} {film.directorLastName}
                </p>
                <p>Rating: {film.rating}</p>
                <p>Age Rating: {film.ageRating}</p>
                <p>
                    Release Date:{" "}
                    {new Date(film.releaseDate).toLocaleDateString()}
                </p>
            </Typography>)
    }

    const mapGenres = (filmGenre: number) => {
        const genre = genres.find((genre) => genre.genreId === filmGenre);
        return genre ? genre.name : "";
    }

    return (
        <div>
            {errorFlag && (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            )}
            {profileMenu()}
            <Typography variant="h2" fontFamily="montserrat" align="center">
                Your Films:
            </Typography>
            <Grid container spacing={2}>
                {directedFilms.map((film) => (
                    <Grid item xs={12} sm={6} md={3} key={film.filmId}>
                        <Paper elevation={4} style={{ padding: "10px", margin: "20px", width: "300px" }}>
                            <Card>
                                <CardActionArea onClick={(e) => {handleReadMore(film)}}>
                                <CardMedia
                                    component="img"
                                    height="400"
                                    image={`http://localhost:4941/api/v1/films/${film.filmId}/image`}
                                    alt={`${film.title} image`}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {film.title}
                                    </Typography>
                                    {displayCardContents(film)}
                                </CardContent>
                                </CardActionArea>
                                <div style={{ display: "flex", justifyContent: "right", alignItems: "right"}}>
                                    <IconButton
                                        size="large"
                                        edge="end"
                                        color="inherit"
                                        aria-label="edit"
                                        sx={{ mr: 2 }}
                                        onClick={(e) => {handleEdit(film)}}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="large"
                                        edge="end"
                                        color="inherit"
                                        aria-label="delete"
                                        sx={{ mr: 2 }}
                                        onClick={handleOpenDialog}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <Dialog open={openDialog} onClose={handleCloseDialog}>
                                        <DialogTitle>Delete Confirmation</DialogTitle>
                                        <DialogContent>
                                            Are you sure you want to delete this film?
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={(e) => {handleDelete(film)}} variant="contained" color="primary">
                                                Delete
                                            </Button>
                                            <Button onClick={handleCloseDialog} variant="outlined" color="primary">
                                                Cancel
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                            </Card>
                        </Paper>
                    </Grid>
                ))}
                {reviewedFilms.map((film) => (
                    <Grid item xs={12} sm={6} md={3} key={film.filmId}>
                        <Paper elevation={4} style={{ padding: "10px", margin: "20px", width: "300px" }}>
                            <Card>
                                <CardActionArea onClick={(e) => {handleReadMore(film)}}>
                                    <CardMedia
                                        component="img"
                                        height="400"
                                        image={`http://localhost:4941/api/v1/films/${film.filmId}/image`}
                                        alt={`${film.title} image`}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {film.title}
                                        </Typography>
                                        {displayCardContents(film)}
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default Films;
