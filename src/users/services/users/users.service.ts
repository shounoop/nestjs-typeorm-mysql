import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/typeorm/entities/Post';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import { CreateUserPostDto } from 'src/users/dtos/CreateUserPost.dto';
import {
  CreateUserParams,
  CreateUserProfileParams,
  UpdateUserParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  findUsers() {
    return this.userRepository.find({ relations: ['profile', 'posts'] });
  }

  createUsers(userDetails: CreateUserParams) {
    const newUser = this.userRepository.create({
      ...userDetails,
      createdAt: new Date(),
    });

    return this.userRepository.save(newUser);
  }

  updateUser(updateUserDetails: UpdateUserParams) {
    return this.userRepository.update(
      { id: updateUserDetails.id },
      { ...updateUserDetails },
    );
  }

  getUser(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  deleteUser(id: number) {
    return this.userRepository.delete({ id });
  }

  // User Profile
  async createUserProfile(
    userId: number,
    createUserProfileDetails: CreateUserProfileParams,
  ) {
    const user = await this.getUser(userId);

    if (!user) {
      throw new HttpException(
        'User not found. Cannot create Profile',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newProfile = this.profileRepository.create(createUserProfileDetails);

    const savedProfile = await this.profileRepository.save(newProfile);

    user.profile = savedProfile;

    return this.userRepository.save(user);
  }

  // User Post
  async createUserPost(userId, createUserPostDetails: CreateUserPostDto) {
    const user = await this.getUser(userId);

    if (!user) {
      throw new HttpException(
        'User not found. Cannot create Post',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPost = this.postRepository.create({
      ...createUserPostDetails,
      user,
    });

    return this.postRepository.save(newPost);
  }
}
