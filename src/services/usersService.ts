import type { Profile } from '../types';
import { BaseService } from './baseService';

export class UsersService extends BaseService<Profile> {
  constructor() {
    super('profiles');
  }
}

export const usersService = new UsersService();