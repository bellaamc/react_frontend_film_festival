import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import userStore from '../store/index';
import {
    Button,
    Grid,
    Paper,
    TextField,
    Typography,
    Container,
    Avatar,
    Alert,
    AlertTitle,
    createTheme,
    ThemeProvider, MenuItem, Checkbox, Menu, FormControl, InputLabel, Select, AppBar, Toolbar, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuIcon from "@mui/icons-material/Menu";

const theme = createTheme();

const CreateFilm = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [day, setDay] = useState('');
    const [runtime, setRuntime] = useState('');
    const [ageRating, setAgeRating] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [filmName, setFilmName] = useState('');
    const [filmImage, setFilmImage] = useState<File | null>(null);
    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const currentUserToken = userStore((state) => state.token);
    const loggingInToken = userStore((state) => state.setToken)
    const loggingInUser = userStore((state) => state.setLoggedInUser)
    const [genres, setGenres] = useState<Array<Genre>>([]);

    React.useEffect(() => {
        getGenres();
    }, []);

    const getGenres = () => {
        axios
            .get('http://localhost:4941/api/v1/films/genres')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage('');
                setGenres(response.data);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const mapGenresToDictionary = () => {
        const genreDictionary: { [key: number]: string } = {};
        genres.forEach((genre) => {
            genreDictionary[genre.genreId] = genre.name;
        });
        return genreDictionary;
    };

    const genreDictionary = mapGenresToDictionary()
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Check if film image is selected
        if (!filmImage || !filmName || !description || !genre) {
            setErrorFlag(true);
            setErrorMessage('Please fill in the required categories.');
            return;
        }
        try {
            const formattedDate = `${year}-${month}-${day} 00:00:00`;
            // Validate input
            let requestBody: Partial<Film> = {
                title: filmName,
                description: description,
                genreId: Number(genre),
            };

            if (day !== "" && month !== "" && year !== "") {
                requestBody.releaseDate = formattedDate
            }

            if (ageRating !== "") {
                requestBody.ageRating = ageRating
            }

            if (runtime !== "") {
                requestBody.runtime = Number(runtime);
            }

            const postHeaders = {
                'X-Authorization': currentUserToken,
            };

            const filmUploadResponse = await axios.post('http://localhost:4941/api/v1/films',
                requestBody,
                {headers: postHeaders}
            );

            // Make the login API call
            let contentType = '';
            const fileExtension = filmImage.name.split('.').pop()?.toLowerCase();

            if (fileExtension === 'png') {
                contentType = 'image/png';
            } else if (fileExtension === 'jpeg' || fileExtension === 'jpg') {
                contentType = 'image/jpeg';
            } else if (fileExtension === 'gif') {
                contentType = 'image/gif';
            }

            const headers = {
                'X-Authorization': currentUserToken,
                'Content-Type': contentType,
            };

            // Make the image upload API call
            const imageUploadData = new Blob([filmImage], { type: contentType });

            await axios.put(
                `http://localhost:4941/api/v1/films/${filmUploadResponse.data.filmId}/image`,
                imageUploadData,
                { headers }
            );

            setFilmName('');
            setDescription('');
            setGenre('');
            setDay('');
            setMonth('');
            setYear('');
            setAgeRating('');
            setRuntime('');
            setFilmImage(null);
            setErrorFlag(false);
            setErrorMessage('Film created successfully.');
            navigate('/films/myfilms');
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setErrorFlag(true);
                setErrorMessage('You must login to add a film.');
            } else if (error.response && error.response.status === 403) {
                setErrorFlag(true);
                setErrorMessage('Film title must be unique to add the film.');
            } else {
                setErrorFlag(true);
                setErrorMessage('Creating this film failed. Please try again.');
            }
        }
    };

    const handleFilmImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFilmImage(event.target.files[0]);
        }
    };

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
                            <MenuItem onClick={handleLogout} value="logout">Logout</MenuItem>
                            <MenuItem onClick={handleCreateFilm} value="createFilm">Create Film</MenuItem>
                            <MenuItem onClick={handleViewFilms} value="viewFilm">View My Films</MenuItem>
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
            {errorFlag && (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            )}
            {profileMenu()}
            <ThemeProvider theme={theme}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: '#36454F' }}>
                            <AddIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Add A Film
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        name="filmname"
                                        required
                                        fullWidth
                                        id="filmname"
                                        label="Film Name"
                                        value={filmName}
                                        onChange={(e) => setFilmName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="description"
                                        required
                                        multiline
                                        fullWidth
                                        id="description"
                                        label="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                        <FormControl
                                            variant="outlined"
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <InputLabel id="Genre">
                                                Genre *
                                            </InputLabel>
                                            <Select
                                                input={<OutlinedInput label="Genre" />}
                                                labelId="Genre-label"
                                                id="Genre"
                                                fullWidth
                                                required
                                                label="Genre *"
                                                value={genre}
                                                onChange={(e) => setGenre(e.target.value)}
                                            >
                                                {Object.entries(genreDictionary).map(([genreId, genreName]) => (
                                                    <MenuItem key={genreId} value={genreId}>
                                                        <ListItemText primary={genreName} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        name="day"
                                        fullWidth
                                        id="day"
                                        label="Day"
                                        value={day}
                                        onChange={(e) => setDay(e.currentTarget.value)} // Updated handler
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        name="month"
                                        fullWidth
                                        id="month"
                                        label="Month"
                                        value={month}
                                        onChange={(e) => setMonth(e.currentTarget.value)} // Updated handler
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        name="year"
                                        fullWidth
                                        id="year"
                                        label="Year"
                                        value={year}
                                        onChange={(e) => setYear(e.currentTarget.value)} // Updated handler
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl
                                        variant="outlined"
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <InputLabel id="age">
                                            Age Rating
                                        </InputLabel>
                                        <Select
                                            input={<OutlinedInput label="age" />}
                                            labelId="age-label"
                                            id="age"
                                            fullWidth
                                            required
                                            label="Age Rating"
                                            value={ageRating}
                                            onChange={(e) => setAgeRating(e.target.value)}
                                        >
                                            <MenuItem value="G">G</MenuItem>
                                            <MenuItem value="M">M</MenuItem>
                                            <MenuItem value="R13">R13</MenuItem>
                                            <MenuItem value="R16">R16</MenuItem>
                                            <MenuItem value="R18">R18</MenuItem>
                                            <MenuItem value="TBC">TBC</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="runtime"
                                        fullWidth
                                        id="runtime"
                                        label="Runtime"
                                        value={runtime}
                                        onChange={(e) => setRuntime(e.currentTarget.value)} // Updated handler
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center">
                                        <Box flexGrow={1}>
                                            <Typography variant="body1" marginBottom='10px' component="label" htmlFor="film-image">
                                                Film Image *
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <TextField
                                                autoComplete="off"
                                                name="film-image"
                                                required
                                                fullWidth
                                                type="file"
                                                id="film-image"
                                                inputProps={{ accept: 'image/*' }}
                                                onChange={handleFilmImageChange}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                                Create!
                            </Button>
                        </Box>
                        <Link href="http://localhost:3000/users/login" variant="body2">
                            Login
                        </Link>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
};

export default CreateFilm;