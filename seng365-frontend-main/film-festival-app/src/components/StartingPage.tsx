import { ThemeProvider } from '@emotion/react';
import {
    AppBar,
    Button, Card, CardActions, CardHeader,
    Container, createTheme,
    CssBaseline,
    GlobalStyles,
    Grid, Toolbar,
    Typography,
} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom'

const options = [
    {
        title: 'Are You A Casual User?',
        buttonText: 'Continue',
        buttonVariant: 'contained',
    },
    {
        title: 'Create A New Account!',
        buttonText: 'Register',
        buttonVariant: 'outlined',
    },
    {
        title: 'Already Have An Account?',
        buttonText: 'Login',
        buttonVariant: 'outlined',
    },
];

const defaultTheme = createTheme();

const StartingPage = () => {
    React.useEffect(() => {
    }, []);

    const navigate = useNavigate()
    const handleOptions = (option: any) => {
        if (option.buttonText === 'Continue') {
            navigate('/films');
        } else if (option.buttonText === 'Login') {
            navigate('/users/login');
        } else {
            navigate('/users/register');
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <GlobalStyles styles={{ul: {margin: 0, padding: 0, listStyle: 'none'}}}/>
            <CssBaseline/>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Fun Films!
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container disableGutters maxWidth="sm" component="main" sx={{pt: 8, pb: 6}}>
                <Typography
                    component="h1"
                    variant="h2"
                    align="center"
                    color="text.primary"
                    gutterBottom
                >
                    Welcome to Fun Films!
                </Typography>
            </Container>
            <Container maxWidth="md" component="main">
                <Grid container spacing={5} alignItems="flex-end">
                    {options.map((option) => (
                        <Grid item key={option.title} xs={12} sm={6} md={4}>
                            <Card>
                                <CardHeader
                                    title={option.title}
                                    titleTypographyProps={{align: 'center'}}
                                    sx={{
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
                                    }}
                                />
                                <CardActions sx={{justifyContent: 'center'}}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleOptions(option)}
                                    >
                                        {option.buttonText}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </ThemeProvider>
    );
};

export default StartingPage;
