import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams} from 'react-router-dom';
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
    Button, AppBar, Toolbar, IconButton, Menu, MenuItem, Divider
} from "@mui/material";
import Typography from "@mui/material/Typography";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import userStore from "../store";
import MenuIcon from "@mui/icons-material/Menu";

const Profile = () => {
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const theme = useTheme()
    const [user, setUser] = React.useState<User>({
        email: "", firstName: "", lastName: ""})
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const currentUser = userStore((state) => state.loggedInUser)
    const currentUserToken = userStore((state) => state.token)
    const loggingInToken = userStore((state) => state.setToken)
    const loggingInUser = userStore((state) => state.setLoggedInUser)

    const getUser = () => {
        const headers = {
            'X-Authorization': currentUserToken
        };
        axios.get('http://localhost:4941/api/v1/users/' + currentUser, {headers})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUser(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    React.useEffect(() => {
        getUser()
    }, []);

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

    const handleMyFilms = () => {
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

    const handleViewFilms = () => {
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
                            <MenuItem onClick={handleViewFilms} value="view-films">View All Films</MenuItem>
                            <MenuItem onClick={handleMyFilms} value="view-relevant-films">View My Films</MenuItem>
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

    const handleEditProfile = () => {
        navigate(`/users/edit/${currentUser}`)
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
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <Paper elevation={0} style={{padding: "10px", marginTop: "10vh", width: "30vw", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />


                    </ThemeProvider>
                    <Card sx={{display:"flex",justifyContent:"center", alignItems:"center", flexDirection:"column", padding:"10px", width:'100%'}}>
                        <Avatar  alt={user.firstName}
                                 src={`http://localhost:4941/api/v1/users/${currentUser}/image`}
                                 sx={{ width: '20vw', height: '20vw', margin:'10px' }}>
                        </Avatar>


                        <CardContent>
                            <Typography gutterBottom variant="body1" fontFamily="montserrat" component="div" align="center">
                                {user.firstName} {user.lastName}
                            </Typography>
                            <Divider/>
                            <Typography gutterBottom variant="body2" fontFamily="montserrat" component="div" align="left">
                                email: {user.email}
                            </Typography>

                        </CardContent>
                        <Button
                            aria-label="edit-profile"
                            sx={{ mr: 2 }}
                            onClick={handleEditProfile}
                        >Edit Profile
                        </Button>
                    </Card>
                </Paper>
            </div>
        </div>
    )
}
export default Profile;
