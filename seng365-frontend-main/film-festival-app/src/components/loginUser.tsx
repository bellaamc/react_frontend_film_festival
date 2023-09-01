import React, { useState } from 'react';
import axios from "axios";
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
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
    ThemeProvider,
    DialogActions,
    Dialog,
    DialogContent,
    DialogTitle,
    InputAdornment,
    IconButton,
    AppBar,
    Toolbar,
    Menu,
    MenuItem,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import userStore from "../store";
import {useNavigate} from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MenuIcon from "@mui/icons-material/Menu";

const LoginUser = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const loggingInToken = userStore((state) => state.setToken)
    const loggingInUser = userStore((state) => state.setLoggedInUser)
    const currentUserToken = userStore((state) => state.token)
    const [openDialog, setOpenDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const defaultTheme = createTheme();
    const navigate = useNavigate()

    React.useEffect(() => {
    }, []);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (!validateInput()) {
                return;
            }

            // Send registration request
            const loginBody = {
                email: email,
                password: password,
            };

            // Make the login API call
            const loginResponse = await axios.post('http://localhost:4941/api/v1/users/login', loginBody);

            loggingInUser(loginResponse.data.userId)
            loggingInToken(loginResponse.data.token)
            setEmail("")
            setPassword("")
            setErrorFlag(false);
            setErrorMessage('');
            navigate(`/films`)
        } catch (error: any) {
            // Handle registration error
            if (error.response && error.response.status === 400) {
                setErrorFlag(true);
                setErrorMessage('Bad Request. Invalid information');
            } else if (error.response && error.response.status === 401) {
                setErrorFlag(true);
                setErrorMessage('Not Authorised. Incorrect email/password');
            } else {
                setErrorFlag(true);
                setErrorMessage('Logging In failed. Please try again.');
            }
        }
    };

    const validateInput = () => {
        // Perform input validation
        if (currentUserToken !== "") {
            setErrorFlag(true);
            setErrorMessage('You must first logout before logging into another account');
            return false;
        }

        return true;
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handlePasswordToggle = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

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
            {errorFlag && (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            )}
            {profileMenu()}
            <ThemeProvider theme={defaultTheme}>
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
                            Sign in
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
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
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, backgroundColor: '#36454F'}}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item>
                                    <Link href="http://localhost:3000/users/register" variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                                <Grid item sx={{ marginLeft: '90px' }}>
                                    <Link href="#" variant="body2" onClick={handleOpenDialog}>
                                        {"Want to log out?"}
                                    </Link>
                                </Grid>
                                <Dialog open={openDialog} onClose={handleCloseDialog}>
                                    <DialogTitle>Logout Confirmation</DialogTitle>
                                    <DialogContent>
                                        Are you sure you want to log out?
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleLogout} variant="contained" color="primary">
                                            Logout
                                        </Button>
                                        <Button onClick={handleCloseDialog} variant="outlined" color="primary">
                                            Cancel
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Grid>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
};

export default LoginUser;
