import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import axios from 'axios';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import userStore from '../store/index'
import {
    Button,
    Grid,
    TextField,
    Typography,
    Container,
    Avatar,
    Alert,
    AlertTitle,
    createTheme,
    ThemeProvider, InputAdornment, IconButton, AppBar, Toolbar, Menu, MenuItem,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MenuIcon from "@mui/icons-material/Menu";
const theme = createTheme();

const RegisterUser = () => {
    const navigate = useNavigate()
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const loggingInUser = userStore((state) => state.setLoggedInUser)
    const loggingInUserToken = userStore((state) => state.setToken)
    const userToken = userStore((state) => state.token)
    const [showPassword, setShowPassword] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    React.useEffect(() => {
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            // Validate input
            if (!validateInput()) {
                return;
            }

            const requestBody = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: password,
            };

            // Send registration request
            const registrationResponse = await axios.post('http://localhost:4941/api/v1/users/register', requestBody);

            const loginBody = {
                email: email,
                password: password,
            };

            // Make the login API call
            const loginResponse = await axios.post('http://localhost:4941/api/v1/users/login', loginBody);
            loggingInUser(loginResponse.data.userId)
            loggingInUserToken(loginResponse.data.token)
            if (profilePicture) {
                let contentType = '';
                const fileExtension = profilePicture.name.split('.').pop()?.toLowerCase();

                if (fileExtension === 'png') {
                    contentType = 'image/png';
                } else if (fileExtension === 'jpeg' || fileExtension === 'jpg') {
                    contentType = 'image/jpeg';
                } else if (fileExtension === 'gif') {
                    contentType = 'image/gif';
                }

                const headers = {
                    'X-Authorization': loginResponse.data.token,
                    'Content-Type': contentType,
                };

                // Make the image upload API call
                const imageUploadData = new Blob([profilePicture], { type: contentType });

                await axios.put(`http://localhost:4941/api/v1/users/${registrationResponse.data.userId}/image`, imageUploadData, { headers });
                setEmail("")
                setFirstName("")
                setLastName("")
                setPassword("")
                setProfilePicture(null)
                setErrorFlag(false);
                setErrorMessage('Registered successfully.');
                navigate(`/films`)
            }
            setErrorFlag(false);
            setErrorMessage('');

            // Perform login (optional, depends on the backend implementation)
            // ... Perform login logic ...

        } catch (error: any) {
            // Handle registration error
            if (error.response && error.response.status === 403) {
                setErrorFlag(true);
                setErrorMessage('Cannot use this email. It is already in use.');
            } else {
                // Handle registration error
                console.error('Registration error:', error);
                setErrorFlag(true);
                setErrorMessage('Registration failed. Please try again.');
            }
        }
    };

    const validateInput = () => {
        // Perform input validation
        if (!emailIsValid(email)) {
            setErrorFlag(true);
            setErrorMessage('Invalid email address.');
            return false;
        }

        if (password.length < 6) {
            setErrorFlag(true);
            setErrorMessage('Password must be at least 6 characters long.');
            return false;
        }

        // Additional validation logic (if needed)

        return true;
    };

    const emailIsValid = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setProfilePicture(event.target.files[0]);
        }
    };

    const handlePasswordToggle = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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

    const handleViewAllFilms = () => {
        navigate('/films');
        handleMenuClose();
    }

    const handleLogout = async () => {
        try {
            const headers = {
                'X-Authorization': userToken
            };

            await axios.post('http://localhost:4941/api/v1/users/logout', null, {
                headers: headers
            });
            loggingInUser(0);
            loggingInUserToken('');
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
                            {userToken !== "" ? (
                                <>
                                    <MenuItem onClick={handleProfile} value="profile">Profile</MenuItem>
                                    <MenuItem onClick={handleLogout} value="logout">Logout</MenuItem>
                                    <MenuItem onClick={handleCreateFilm} value="createFilm">Create Film</MenuItem>
                                    <MenuItem onClick={handleViewFilms} value="viewFilm">View My Films</MenuItem>
                                </>
                            ) : (
                                <>
                                    <MenuItem onClick={handleViewAllFilms} value="viewFilm">View Films</MenuItem>
                                    <MenuItem onClick={handleLogin} value="login">Login</MenuItem>
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
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Register
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="fname"
                                        name="firstName"
                                        required
                                        fullWidth
                                        id="firstName"
                                        label="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="lname"
                                        name="lastName"
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        autoComplete="email"
                                        name="email"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        autoComplete="password"
                                        name="password"
                                        required
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.currentTarget.value)} // Updated handler
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handlePasswordToggle}>
                                                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center">
                                        <Box flexGrow={1}>
                                            <Typography variant="body1" marginBottom='10px' component="label" htmlFor="profilePicture">
                                                Profile Picture
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <TextField
                                                autoComplete="off"
                                                name="profilePicture"
                                                fullWidth
                                                type="file"
                                                id="profilePicture"
                                                inputProps={{ accept: 'image/*' }}
                                                onChange={handleProfilePictureChange}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, backgroundColor: '#36454F' }}
                            >
                                Register
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="http://localhost:3000/users/login" variant="body2">
                                        Already have an account? Sign in
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
};

export default RegisterUser;
