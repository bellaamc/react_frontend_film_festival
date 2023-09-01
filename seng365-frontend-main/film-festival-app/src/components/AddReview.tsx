import React, { useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
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
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from "@mui/material/OutlinedInput";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";

const theme = createTheme();

const ReviewFilm = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const {id} = useParams();
    const [rating, setRating] = useState("");
    const [review, setReview] = useState("");
    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const currentUserToken = userStore((state) => state.token);
    const loggingInToken = userStore((state) => state.setToken)
    const loggingInUser = userStore((state) => state.setLoggedInUser)
    React.useEffect(() => {
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            if (Number(rating) > 10 || Number(rating) < 1) {
                setErrorFlag(true);
                setErrorMessage('Rating must be between 1 and 10');
            }

            const postHeaders = {
                'X-Authorization': currentUserToken,
            };

            let requestBody: Partial<Review> = {
                rating: Number(rating)
            };

            if (review !== "") {
                requestBody.review = review;
            }

            const filmEditResponse = await axios.post(`http://localhost:4941/api/v1/films/${id}/reviews`,
                requestBody,
                {headers: postHeaders}
            );

            setErrorMessage('Film created successfully.');
            navigate(`/films/${id}`);
            window.location.reload()
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setErrorFlag(true);
                setErrorMessage('You must login to make a review.');
            } else {
                // Handle registration error
                setErrorFlag(true);
                setErrorMessage('Reviewing this film failed. Please try again.');
            }
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
            } else if (error.response && error.response.status === 403) {
                setErrorFlag(true);
                setErrorMessage('Cannot post more than one review on a film.');
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
                            <EditIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Review A Film
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
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
                                            Rating *
                                        </InputLabel>
                                        <Select
                                            input={<OutlinedInput label="Genre" />}
                                            labelId="Genre-label"
                                            id="Genre"
                                            fullWidth
                                            required
                                            label="Genre *"
                                            value={rating}
                                            onChange={(e) => {
                                                setRating(e.target.value);
                                            }}
                                        >
                                            {(Array.from({ length: 10 }, (_, index) => index + 1)).map((number) => (
                                                <MenuItem key={number} value={number}>
                                                    <ListItemText primary={number} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="review"
                                        multiline
                                        fullWidth
                                        id="review"
                                        label="Review"
                                        value={review}
                                        onChange={(e) => {
                                            setReview(e.target.value);
                                        }}
                                    />
                                </Grid>
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                                Make Review!
                            </Button>
                            </Grid>
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

export default ReviewFilm;