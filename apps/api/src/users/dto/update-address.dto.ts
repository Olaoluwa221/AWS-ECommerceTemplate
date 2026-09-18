import { PartialType } from '@nestjs/mapped-types';

import { AddAddressDto } from './add-address.dto.js';

export class UpdateAddressDto extends PartialType(AddAddressDto) {}