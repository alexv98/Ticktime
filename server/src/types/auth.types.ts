export type AuthDataType = {
  email: string;
  password: string;
  name: string;
};

export type LoginDataType = Omit<AuthDataType, 'name'>;
