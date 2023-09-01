import create from 'zustand';

interface UserState {
    loggedInUser: number

    setLoggedInUser: (user: number) => void;

    token: string

    setToken: (tokenVal: string) => void;
}

const getLocalVals = (key:string): string => JSON.parse(window.localStorage.getItem(key) as string);

const setLocalVals = (key: string, value: any) => window.localStorage.setItem(key, JSON.stringify(value));

const userStore = create<UserState>((set) => ({
    loggedInUser: Number(getLocalVals('loggedInUser') || 0),
    token: getLocalVals('token') || "",
    setLoggedInUser: (loggedInUser: number) => set(() => {
        setLocalVals('loggedInUser', loggedInUser)
        return {loggedInUser: loggedInUser}
    }),
    setToken: (tokenVal: string) => set(() => {
        setLocalVals('token', tokenVal)
        return {token: tokenVal}
    })
}))

export default userStore;