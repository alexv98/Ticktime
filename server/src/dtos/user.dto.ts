import { IUser } from '../types/user.types';

class UserDto {
  email;
  id;
  isActivated;
  name;

  constructor(model: IUser) {
    this.email = model.email;
    this.id = model.id;
    this.isActivated = model.isActivated;
    this.name = model.name;
  }
}

export default UserDto;
