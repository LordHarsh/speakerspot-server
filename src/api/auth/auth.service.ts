import bcrypt from 'bcrypt';
import { ERRORS } from '../../shared/errors';
import generateToken from '../../shared/jwt';
import { getModel } from '../../shared/models';
import { OtpService } from '../../shared/otp';
import { generateUsername } from '../../shared/username.generator';

export const handleCreateUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phoneNo: string,
  entity: string,
): Promise<void> => {
  const Model = await getModel(entity);
  const existingUser = await Model.findOne({ where: { email } });
  if (existingUser) {
    throw {
      statusCode: ERRORS.USER_ALREADY_EXISTS_ERROR.code,
      message: ERRORS.USER_ALREADY_EXISTS_ERROR.message.error_description,
    };
  }

  // Generate unique username
  let userName = generateUsername(firstName, lastName);
  let checkExistingUsername = await Model.findOne({ where: { userName } });
  while (checkExistingUsername) {
    userName = generateUsername(firstName, lastName);
    checkExistingUsername = await Model.findOne({ where: { userName } });
  }

  // Hash password and create user
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  await Model.create({
    userName,
    firstName,
    lastName,
    verified: false,
    verifiedAt: null,
    email,
    phoneNo,
    password: hash,
    isDeleted: false,
  });
};

export const handleSendOtp = async (
  email: string,
  entity: string,
): Promise<void> => {
  const Model = await getModel(entity);
  const user = await Model.findOne({ where: { email } });
  if (!user) {
    throw { statusCode: 404, message: 'User Does Not Exist' };
  }
  await OtpService.sendOTPEmail(email);
};
export const handleVerifyOtp = async (
  email: string,
  otp: string,
  entity: string,
): Promise<void> => {
  const Model = await getModel(entity);
  const user = await Model.findOne({ where: { email } });
  if (!user) {
    throw { statusCode: 404, message: 'User Does Not Exist' };
  }
  const isValid = await OtpService.verifyOTP(email, otp);
  if (!isValid) {
    throw { statusCode: 401, message: 'Invalid OTP' };
  }
  Model.update(
    {
      verified: true,
      verifiedAt: new Date(),
    },
    { where: { email } },
  );
};

export const handleLoginUser = async (
  email: string,
  password: string,
  entity: string,
): Promise<unknown> => {
  const Model = await getModel(entity);
  const user = await Model.findOne({ where: { email } });
  if (!user) {
    throw { statusCode: 404, message: 'User Does Not Exist' };
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw { statusCode: 401, message: 'Incorrect Password / Not Allowed' };
  }

  const isVerified = user.verified;
  if (!isVerified) {
    await OtpService.sendOTPEmail(email);
  }
  return generateToken(user.id, email, entity);
};

export const handleUpdatePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string,
  entity: string,
): Promise<unknown> => {
  const Model = await getModel(entity);
  const user = await Model.findOne({ where: { email } });
  if (!user) {
    throw {
      statusCode: ERRORS.USER_NOT_FOUND_ERROR.code,
      message: ERRORS.USER_NOT_FOUND_ERROR.message.error_description,
    };
  }
  if (oldPassword === newPassword) {
    throw {
      statusCode: ERRORS.SAME_PASSWORD.code,
      message: ERRORS.SAME_PASSWORD.message.error_description,
    };
  }
  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordCorrect) {
    throw {
      statusCode: ERRORS.INCORRECT_PASSWORD.code,
      message: ERRORS.INCORRECT_PASSWORD.message.error_description,
    };
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await Model.update({ password: hashedNewPassword }, { where: { email } });
  return generateToken(user.id, email, entity);
};
