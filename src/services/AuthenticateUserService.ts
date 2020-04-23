import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import authConfig from '../config/auth';
import AppError from '../errors/AppError';

import User from '../models/User';

interface RequestDTO {
  email: string;
  password: string;
}

class AuthenticateUserService {
  public async execute({
    email,
    password,
  }: RequestDTO): Promise<{ user: User; token: string }> {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new AppError('incorrect email or password.', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      throw new Error('incorrect email or password.');
    }
    // usuario autenticado a partir daqui

    return { user, token };
  }
}

export default AuthenticateUserService;
