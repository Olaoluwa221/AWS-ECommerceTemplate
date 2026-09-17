import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateOptionDefinitionDto } from './dto/create-option-definition.dto';
import { UpdateOptionDefinitionDto } from './dto/update-option-definition.dto';
import { OptionDefinitionService } from './option-definition.service';

@Controller('option-definitions')
export class OptionDefinitionController {
    constructor(
        private readonly optionDefinitionService:
            OptionDefinitionService,
    ) { }

    // Create a new option definition.
    @Post()
    @Roles(UserRole.ADMIN)
    create(
        @Body() createOptionDefinitionDto: CreateOptionDefinitionDto,
    ) {
        return this.optionDefinitionService.create(
            createOptionDefinitionDto,
        );
    }

    // List all option definitions, including inactive ones.
    @Get()
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.optionDefinitionService.findAll();
    }

    // Find an option definition by its name.
    @Get(':name')
    @Roles(UserRole.ADMIN)
    findByName(@Param('name') name: string) {
        return this.optionDefinitionService.findByName(name);
    }

    // Update the editable fields on an option definition.
    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(
        @Param('id') id: string,
        @Body() updateOptionDefinitionDto: UpdateOptionDefinitionDto,
    ) {
        return this.optionDefinitionService.update(
            id,
            updateOptionDefinitionDto,
        );
    }

    // Deactivate an option definition without deleting it.
    @Patch(':id/deactivate')
    @Roles(UserRole.ADMIN)
    deactivate(@Param('id') id: string) {
        return this.optionDefinitionService.deactivate(id);
    }

    // Reactivate a previously deactivated option definition.
    @Patch(':id/reactivate')
    @Roles(UserRole.ADMIN)
    reactivate(@Param('id') id: string) {
        return this.optionDefinitionService.reactivate(id);
    }

    // Permanently delete an inactive option definition.
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.optionDefinitionService.remove(id);
    }
}
