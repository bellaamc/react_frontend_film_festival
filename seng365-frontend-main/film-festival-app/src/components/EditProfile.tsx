import React, { useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import CssBaseline from '@mui/material/CssBaseline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import userStore from '../store/index';
import {
    Button,
    Grid,
    TextField,
    Typography,
    Container,
    InputAdornment,
    Avatar,
    Alert,
    AlertTitle,
    createTheme,
    ThemeProvider, DialogTitle, DialogContent, DialogActions, Dialog, IconButton, AppBar, Toolbar, Menu, MenuItem
} from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";

const theme = createTheme();

const EditProfile = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const [altered, setAltered] = useState(false);
    const [editedFirstName, setEditedFirstName] = useState('');
    const [editedLastName, setEditedLastName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedPassword, setEditedPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [user, setUser] = useState<User>({
        email: "", firstName: "", lastName: ""})
    const [editedProfilePicture, setEditedProfilePicture] = useState<File | null>(null);
    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const currentUserToken = userStore((state) => state.token);
    const currentUser = userStore((state) => state.loggedInUser);
    const [showPassword, setShowPassword] = useState(false);
    const loggingInToken = userStore((state) => state.setToken)
    const loggingInUser = userStore((state) => state.setLoggedInUser)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    React.useEffect(() => {
        const getUser = () => {
            const headers = {
                'X-Authorization': currentUserToken
            };
            axios.get('http://localhost:4941/api/v1/users/' + currentUser, {headers})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setUser(response.data)
                    setEditedFirstName(response.data.firstName)
                    setEditedLastName(response.data.lastName)
                    setEditedEmail(response.data.email)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getUser()
    }, [currentUser, currentUserToken]);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (currentUserToken === "") {
            setErrorFlag(true);
            setErrorMessage('You must login before editing a profile');
            return;
        }
        if (!altered) {
            setErrorFlag(true);
            setErrorMessage('You must make a change to edit a profile');
            return;
        }
        try {
            // Validate input
            let requestBody: Partial<PatchUser> = {
            };

            if (editedFirstName !== user.firstName) {
                requestBody.firstName = editedFirstName
            }

            if (editedLastName !== user.lastName) {
                requestBody.lastName = editedLastName
            }

            if (editedEmail !== user.email) {
                requestBody.email = editedEmail
            }

            if (editedPassword !== "") {
                requestBody.password = editedPassword
                requestBody.currentPassword = oldPassword
            }

            const postHeaders = {
                'X-Authorization': currentUserToken,
            };

            await axios.patch(`http://localhost:4941/api/v1/users/${id}`,
                requestBody,
                {headers: postHeaders}
            );
            // Make the login API call
            if (editedProfilePicture !== null) {
                let contentType = '';
                const fileExtension = editedProfilePicture.name.split('.').pop()?.toLowerCase();

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
                const imageUploadData = new Blob([editedProfilePicture], {type: contentType});

                await axios.put(
                    `http://localhost:4941/api/v1/users/${id}/image`,
                    imageUploadData,
                    {headers}
                );
            }

            setEditedFirstName('');
            setEditedLastName('');
            setEditedEmail('');
            setEditedProfilePicture(null);
            setErrorFlag(false);
            setAltered(false);
            setErrorMessage('Film created successfully.');
            navigate('/films/myfilms');
        } catch (error:any) {
            if (error.response && error.response.status === 401) {
                setErrorFlag(true);
                setErrorMessage('Unauthorized or Invalid currentPassword');
            } else if (error.response && error.response.status === 403) {
                setErrorFlag(true);
                setErrorMessage('Forbidden. This is not your account, or the email is already in use, or identical current and new passwords');
            } else if (error.response && error.response.status === 404) {
                setErrorFlag(true);
                setErrorMessage('Not found');
            } else {
                setErrorFlag(true);
                setErrorMessage('Profile edit failed');
            }
        }
    };

    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setEditedProfilePicture(event.target.files[0]);
            setAltered(true)
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
            if (error.response && error.response.status === 401) {
                setErrorFlag(true);
                setErrorMessage('Unauthorized or Invalid currentPassword');
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
                            Edit Your Profile
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        name="firstname"
                                        fullWidth
                                        id="firstname"
                                        label="First Name"
                                        value={editedFirstName}
                                        onChange={(e) => {
                                            setEditedFirstName(e.target.value);
                                            setAltered(true);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="last-name"
                                        multiline
                                        fullWidth
                                        id="last-name"
                                        label="Last Name"
                                        value={editedLastName}
                                        onChange={(e) => {
                                            setEditedLastName(e.target.value);
                                            setAltered(true);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="email"
                                        multiline
                                        fullWidth
                                        id="email"
                                        label="Email"
                                        value={editedEmail}
                                        onChange={(e) => {
                                            setEditedEmail(e.target.value);
                                            setAltered(true);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        autoComplete="password"
                                        name="password"
                                        fullWidth
                                        id="password"
                                        label="Old Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={(e) => {
                                            setOldPassword(e.target.value);
                                        }}
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
                                    <TextField
                                        autoComplete="password"
                                        name="password"
                                        fullWidth
                                        id="password"
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={editedPassword}
                                        onChange={(e) => {
                                            setEditedPassword(e.target.value);
                                            setAltered(true);
                                        }}
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
                                            <Typography variant="body1" marginBottom='10px' component="label" htmlFor="film-image">
                                                Profile Image *
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <TextField
                                                autoComplete="off"
                                                name="profile-image"
                                                fullWidth
                                                type="file"
                                                id="profile-image"
                                                inputProps={{ accept: 'image/*' }}
                                                onChange={handleProfilePictureChange}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                                Make Edit!
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
};

export default EditProfile;