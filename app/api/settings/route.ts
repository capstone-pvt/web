import { NextRequest } from 'next/server';
import SettingRepository from '@/lib/repositories/setting.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest, authorizeRequest } from '@/lib/middleware/auth.middleware';
import { PERMISSIONS } from '@/config/permissions';

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.SETTINGS_VIEW]);

    const settings = await SettingRepository.getSettings();
    return successResponse({ settings });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.SETTINGS_MANAGE]);

    const body = await request.json();
    const settings = await SettingRepository.updateSettings(body);
    return successResponse({ settings });
  } catch (error) {
    return errorResponse(error);
  }
}
