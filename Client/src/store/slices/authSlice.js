export const createAuthSlice = (set) => ({
    userInfo: undefined,
    setUserInfo: (userInfo) => {
        set((state)=>({
                userInfo: userInfo
        }));
    }
})