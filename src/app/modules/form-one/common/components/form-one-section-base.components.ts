//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 

import { Component, OnDestroy, Injector } from '@angular/core';
import { FormSectionBaseComponent } from 'src/app/modules/shared/components/form-section-base.component';

@Component({
    selector: 'app-form-one-section-base',
    template: ''
})
export class FormOneSectionBaseComponent extends FormSectionBaseComponent implements OnDestroy {

    constructor(protected injector: Injector) {
        super(injector);
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }

}