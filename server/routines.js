const RoutinesFunc = (RoomList) => {

    this.RoomList = RoomList;
    this.verifyUsersAreStillHereInterval = null;

    this.verifyUsersAreStillHere = () => {
        this.RoomList.forEach((value, index) => {
            if (value.isEmpty) {
                this.RoomList.splice(index, 1);
            }
        });
    };


    this.verifyUsersAreStillHereInterval = setInterval(() => {this.verifyUsersAreStillHere()}, 5000);
};

module.exports = RoutinesFunc;