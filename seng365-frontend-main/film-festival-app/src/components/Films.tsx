import React from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Card from '@mui/material/Card'
import ListItemText from '@mui/material/ListItemText';
import {AppBar, Container, IconButton, Menu, SelectChangeEvent} from '@mui/material';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuIcon from '@mui/icons-material/Menu';
import {
    Alert,
    Checkbox,
    AlertTitle,
    Pagination,
    Paper,
    CardActionArea,
    Grid,
    Button,
    Toolbar,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel
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
    const params = new URLSearchParams();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);    const baseUrl = 'http://localhost:4941/api/v1/films';
    const navigate = useNavigate()
    const [ageRatingQuery, setAgeRatingQuery] = React.useState<Array<string>>([])
    const [genreQuery, setGenreQuery] = React.useState<Array<string>>([])
    const [sortingQuery, setSortingQuery] = React.useState("")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [films, setFilms] = React.useState<Array<Film>>([])
    const [genres, setGenres] = React.useState<Array<Genre>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const currentUserToken = userStore((state) => state.token)
    const loggingInToken = userStore((state) => state.setToken)
    const loggingInUser = userStore((state) => state.setLoggedInUser)

    React.useEffect(() => {
        const getFilms = () => {
            axios
                .get(`${baseUrl}?${params.toString()}`)
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage('');
                    setFilms(response.data.films);
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        };
        searchParameters()
        getFilms()
        getGenres()
    }, [searchQuery, sortingQuery, ageRatingQuery, itemsPerPage])

    const searchParameters = () => {
        if (searchQuery !== "") {
            params.set('q', searchQuery);
        } else {
            params.delete('q')
        }
        if (sortingQuery !== "") {
            params.set('sortBy', sortingQuery);
        } else {
            params.delete('sortBy')
        }
        if (genreQuery.length > 0) {
            params.delete('genreIds'); // Clear previous genreIds parameters

            genreQuery.forEach((genreId) => {
                params.append('genreIds', genreId);
            });
        } else {
            params.delete('genreIds');
        }
        if (ageRatingQuery.length > 0) {
            params.delete('ageRatings'); // Clear previous genreIds parameters

            ageRatingQuery.forEach((ageRating) => {
                params.append('ageRatings', ageRating);
            });
        } else {
            params.delete('ageRatings');
        }
    }

    const handleClick = (film: Film) => {
        navigate(`/films/${film.filmId}`)
    }

    const handleSorting = (event: SelectChangeEvent<string>) => {
        setSortingQuery(event.target.value); // Update the sortingQuery state
    };

    const pageLabel = () => {
        return (
            <FormControl
                    variant="outlined"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <InputLabel id="ItemsPerPage-label" sx={{ color: 'white' }}>
                        Number Of Items
                    </InputLabel>
                    <Select
                        input={<OutlinedInput label="Genre" />}
                        labelId="ItemsPerPage-label"
                        id="ItemsPerPage"
                        value={itemsPerPage}
                        label="Items per page"
                        onChange={handleItemsPerPageChange}
                        style={{ color: "white" }}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                    </Select>
                </FormControl>
        )
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
        const selectedValue = event.target.value;
        setItemsPerPage(Number(selectedValue));
        setCurrentPage(1); // Reset current page to 1 when items per page is changed
    };

    const ageRatingMenu = () => {
        const ageRatings = ['G', 'PG', 'M', 'R13', 'R16', 'R18', 'TBC']
        return (
            // <form onSubmit={handleSearch}>
            <FormControl
                    variant="outlined"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <InputLabel id="age-rating-label" sx={{ color: 'white' }}>
                        Age Rating
                    </InputLabel>
                    <Select
                        labelId="age-rating-label"
                        id="age-rating"
                        multiple={true}
                        value={ageRatingQuery}
                        onChange={ageHandler}
                        input={<OutlinedInput label="Genre" />}
                        label="Age Rating"
                        style={{ color: 'white' }}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                        {ageRatings.map((ageRating) => (
                            <MenuItem key={ageRating} value={ageRating}>
                                <Checkbox checked={ageRatingQuery.indexOf(ageRating) > -1} />
                                <ListItemText primary={ageRating} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
        );
    };

    const genreHandler = (event: SelectChangeEvent<string[]>) => {
        const selectedGenres = Array.isArray(event.target.value)
            ? event.target.value
            : [event.target.value];
        setGenreQuery(selectedGenres);
    };

    const ageHandler = (event: SelectChangeEvent<string[]>) => {
        const selectedGenres = Array.isArray(event.target.value)
            ? event.target.value
            : [event.target.value];
        setAgeRatingQuery(selectedGenres);
    };
    const genreMenu = () => {
        const genreDictionary = mapGenresToDictionary();

        return (
            // <form onSubmit={handleSearch}>
            <FormControl
                    variant="outlined"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <InputLabel id="genre-label" sx={{ color: 'white' }}>
                        Genre
                    </InputLabel>
                    <Select
                        labelId="genre-label"
                        id="genre"
                        multiple={true}
                        value={genreQuery}
                        onChange={genreHandler}
                        input={<OutlinedInput label="Genre" />}
                        label="Genre"
                        style={{ color: 'white' }}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                        {Object.entries(genreDictionary).map(([genreId, genreName]) => (
                            <MenuItem key={genreId} value={genreId}>
                                <Checkbox checked={genreQuery.indexOf(genreId) > -1} />
                                <ListItemText primary={genreName} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            // </form>
        );
    };

    const filterComponent = () => {
        return (
            // <form onSubmit={handleSearch}>
            <FormControl
                    variant="outlined"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <InputLabel id="Sorting-label" sx={{ color: "white", }}>Sort</InputLabel>
                    <Select
                        labelId="Sorting-label"
                        id="Sorting"
                        value={sortingQuery}
                        label="Sort by"
                        onChange={handleSorting}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={'ALPHABETICAL_ASC'}>Alphabetical ASC</MenuItem>
                        <MenuItem value={'ALPHABETICAL_DESC'}>Alphabetical DESC</MenuItem>
                        <MenuItem value={'RELEASED_ASC'}>Release Date ASC</MenuItem>
                        <MenuItem value={'RELEASED_DESC'}>Release Date DESC</MenuItem>
                        <MenuItem value={'RATING_ASC'}>Rating Date ASC</MenuItem>
                        <MenuItem value={'RATING_DESC'}>Rating Date DESC</MenuItem>
                    </Select>
                </FormControl>
            // </form>
        )
    }

    const renderSearch = () => {
        return (
            <form onSubmit={handleSearch}>
            <TextField
                    id="search-bar"
                    className="text"
                    label="Search..."
                    variant="outlined"
                    placeholder="Search..."
                    size="small"
                    value={searchQuery}
                    onChange={keyChangeHandler}
                />
                <Button variant="contained" sx={{
                    m: 1,
                    minWidth: 120,
                    backgroundColor: '#36454F',
                    borderRadius: '4px',
                }} type="submit">Search</Button>
            </form>
        )
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

    const keyChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
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
    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCurrentPage(1);
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogin = () => {
        navigate('/users/login');
        handleMenuClose();
    }

    const handleProfile = () => {
        navigate('/users/profile');
        handleMenuClose();
    }

    const handleCreateFilm = () => {
        navigate('/films/create');
        handleMenuClose();
    }

    const handleViewFilms = () => {
        navigate('/films/myfilms');
        handleMenuClose();
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
                                <MenuItem onClick={handleLogin} value="login">Login</MenuItem>
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

    const mapGenresToDictionary = () => {
        const genreDictionary: { [key: number]: string } = {};
        genres.forEach((genre) => {
            genreDictionary[genre.genreId] = genre.name;
        });
        return genreDictionary;
    };

    const mapGenres = (filmGenre: number) => {
        const genre = genres.find((genre) => genre.genreId === filmGenre);
        return genre ? genre.name : "";
    }

    const currentItems = films.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            {errorFlag && (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            )}
            {profileMenu()}
            <Container maxWidth="md" component="main">
                <Grid container spacing={40} marginTop="20px" alignItems="flex-end">
                    {filterComponent()}
                    {pageLabel()}
                    {genreMenu()}
                    {ageRatingMenu()}
                    {renderSearch()}
                </Grid>
            </Container>
            <Grid container spacing={2}>
                {currentItems.map((film) => (
                    <Grid item xs={12} sm={6} md={3} key={film.filmId}>
                        <Paper elevation={4} style={{ padding: "10px", margin: "20px", width: "300px" }}>
                            <Card>
                                <CardActionArea onClick={() => handleClick(film)}>
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
            <Pagination
                count={Math.ceil(films.length / itemsPerPage)}
                page={currentPage}
                onChange={(event, page) => handlePageChange(page)}
            />
        </div>
    );
};

export default Films;
