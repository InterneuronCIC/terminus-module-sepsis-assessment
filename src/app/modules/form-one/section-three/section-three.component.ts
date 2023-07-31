//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2023  Interneuron Holdings Ltd

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

import { Component, OnInit, Injector, OnDestroy, Input } from '@angular/core';
import { SectionThreeVM } from './sectionThree.model';
import { FormOneContextService } from '../services/form-one-context.service';
import { FormOneSectionBaseComponent } from '../common/components/form-one-section-base.components';
import { FORM_ONE_CONFIG } from '../config/form-one.config';
import { AssessmentDetail, SectionData, AssessmentEntity, Answer } from 'src/app/models/Assessment.model';
import { FormAPIService } from 'src/app/services/form-api.service';
import { GenericMessagePopup } from 'src/app/core/components/generic-message-popup.component';
import { convertJsonDataToString } from 'src/app/core/util';

@Component({
  selector: 'app-section-three',
  templateUrl: './section-three.component.html',
  styleUrls: ['./section-three.component.css']
})
export class SectionThreeComponent extends FormOneSectionBaseComponent implements OnInit, OnDestroy {

  //submitformcollection: FormSectionDataitem[] = [];

  readOnly = false;
  _actionMode: string;

  @Input() assessment: AssessmentEntity;

  @Input()
  set actionMode(val: string) {

    this._actionMode = val;

    this.readOnly = (val === 'view' || val === 'history' || val === 'viewhistory');
  }
  get actionMode(): string {
    return this._actionMode;
  }

  originalAssessment: AssessmentEntity;

  sectionDataObj: SectionData;

  originalSectionDataObj: SectionData;

  sectionThreeVM: SectionThreeVM = new SectionThreeVM();

  sectionThreeAssessmentDetail: AssessmentDetail;

  ShowRedflagActionPanel: boolean = false;

  showConfirmationMessagePopup = false;

  showLoadingIndicator = false;

  confirmationMessagePopup: GenericMessagePopup = new GenericMessagePopup();

  showSaveStatusMessagePopup = false;

  saveStatusMessagePopup: GenericMessagePopup = new GenericMessagePopup();

  displayChart = false;

  disableOptions = false;

  constructor(protected injector: Injector,
    private formOneContextService: FormOneContextService,
    private formAPIService: FormAPIService
  ) {
    super(injector);

    this.saveConfirmation(this.confirmationMessagePopup, FORM_ONE_CONFIG.section_3_config.messages.SaveConfirmationMessage,
      () => {
        this.showConfirmationMessagePopup = false;
        this.submitForm();
      }, () => {
        this.showConfirmationMessagePopup = false;
      });
  }

  ngOnInit() {

    this.sectionThreeAssessmentDetail = super.retrieveSectionAssessmentDetail(this.actionMode,
      FORM_ONE_CONFIG.enabled_section_id.section_3_id, this.assessment.assessmentdetails);

    this.sectionDataObj = super.retrieveSectionData(this.actionMode, FORM_ONE_CONFIG.section_3_config.question_1_id, this.sectionThreeAssessmentDetail);

    this.originalSectionDataObj = JSON.parse(JSON.stringify(this.sectionDataObj));// clone and keep

    super.populateControls(this.sectionDataObj, this.sectionThreeVM);

    this.disableOptions = this.sectionThreeVM.selectedYesNo !== 'YES';

    this.computeDisplaySelection(this.sectionThreeVM.selectedYesNo);

    this.formOneContextService.displaySectionFour = this.sectionThreeVM.selectedYesNo == 'NO';

    this.ShowRedflagActionPanel = (!this.readOnly && this.sectionThreeVM.selectedYesNo == 'YES');

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  // ClickYes() {
  //   this.ShowRedflagActionPanel = true;
  //   this.formOneContextService.displaySectionFour = false;
  // }

  // ClickNo() {
  //   this.ShowRedflagActionPanel = false;
  //   this.formOneContextService.displaySectionFour = true;
  // }



  onDecisionChange(event: any) {

    if (this.readOnly) return;

    this.computeDisplaySelection(this.sectionThreeVM.selectedYesNo);

    this.disableOptions = false;

    this.formOneContextService.displaySectionFour = this.sectionThreeVM.selectedYesNo == 'NO';

    this.ShowRedflagActionPanel = this.sectionThreeVM.selectedYesNo == 'YES';

    if (this.sectionThreeVM.selectedYesNo !== 'YES') {
      this.disableOptions = true;
      this.resetOptionsSelected();
    }

    if (this.sectionThreeVM.selectedYesNo !== 'NO') {
      this.resetOtherDependentSectionsData();
    }

    let answer = this.sectionDataObj.sectiondata[0].answer; //since it have only one question

    answer['selectedYesNo'] = this.sectionThreeVM.selectedYesNo;

    let metaIndex = answer.meta.findIndex(m => m.key === 'YES' || m.key === 'NO' || m.key === 'NOT ANSWERED');

    if (metaIndex > -1) {
      answer.meta.splice(metaIndex, 1);
    }
    answer.meta.push({ key: this.sectionThreeVM.selectedYesNo });

    this.sectionThreeAssessmentDetail.assessmentdataAsJSON = this.sectionDataObj;

    this.loggerService.log('New Data: onDecisionChange');

    this.loggerService.log(this.sectionThreeAssessmentDetail.assessmentdataAsJSON);
  }


  onOptionChange(e: any) {

    if (this.readOnly) return;

    const id = e.key;
    const itemText = e.text;

    let answer = this.sectionDataObj.sectiondata[0].answer; //since it have only one question
    answer[id] = this.sectionThreeVM[id];

    let metaIndex = answer.meta.findIndex(m => m.key === itemText);

    if (metaIndex > -1) {

      if (!this.sectionThreeVM[id]) {// remove 
        answer.meta.splice(metaIndex, 1);
      }
    } else if (this.sectionThreeVM[id]) {//selected true
      answer.meta.push({ key: itemText });
    }

    this.sectionThreeAssessmentDetail.assessmentdataAsJSON = this.sectionDataObj;

    this.loggerService.log('New Data');

    this.loggerService.log(this.sectionThreeAssessmentDetail.assessmentdataAsJSON);
  }

  resetOtherDependentSectionsData(): any {

    let dependentAssessmentDetails: AssessmentDetail[] = this.assessment.assessmentdetails.filter(ad =>
      ad.formsection_id == FORM_ONE_CONFIG.enabled_section_id.section_4_id);

    if (dependentAssessmentDetails) {
      dependentAssessmentDetails.forEach(ad => {
        ad.assessmentdata = '';
        ad.assessmentdataAsJSON = new SectionData();
      });
    }
  }

  resetOptionsSelected() {

    let resetAnswer = new Answer();
    resetAnswer.meta = [];
    this.sectionDataObj.sectiondata[0].answer = resetAnswer;

    this.sectionThreeVM.Weakhighpitchedorcontinuouscry = false;
    this.sectionThreeVM.Temperature = false;
    this.sectionThreeVM.Severetachypnoea = false;
    this.sectionThreeVM.Severetachycardia = false;
    this.sectionThreeVM.Nonblanchingrashmottledashencyanotic = false;
    this.sectionThreeVM.Looksveryunwelltohealthcareprofessional = false;
    this.sectionThreeVM.Ifunder3monthstemperature = false;
    this.sectionThreeVM.Doesnwakewhenrousedwonstayawake = false;
    this.sectionThreeVM.Bradycardia = false;
  }

  showChart(e: any) {
    this.displayChart = true;
  }

  onChartClose(e: any) {
    this.displayChart = false;
  }

  confirmSave() {
    this.showConfirmationMessagePopup = true;
  }

  submitForm() {

    this.loggerService.log('Showing the assessment data gathered in section 3...');

    this.loggerService.log(this.assessment);

    this.showLoadingIndicator = true;

    this.assessment.taskformsectionid = FORM_ONE_CONFIG.enabled_section_id.section_3_id;

    this.formAPIService.saveAssessment(this.actionMode, this.assessment, (newAssessment) => {

      if (!newAssessment) {
        this.showLoadingIndicator = false;
        this.preparePostSaveActionBasedOnStatus('error');
        this.showSaveStatusMessagePopup = true;
        return;
      }

      let section1AssessmentDetail: AssessmentDetail = this.assessment.assessmentdetails.find(ad => ad.formsection_id == FORM_ONE_CONFIG.enabled_section_id.section_1_id);

      let section2AssessmentDetail: AssessmentDetail = this.assessment.assessmentdetails.find(ad => ad.formsection_id == FORM_ONE_CONFIG.enabled_section_id.section_2_id);

      let section4AssessmentDetail: AssessmentDetail = this.assessment.assessmentdetails.find(ad => ad.formsection_id == FORM_ONE_CONFIG.enabled_section_id.section_4_id);

      let assessDetailsToPersist = [];

      if (section1AssessmentDetail) {
        section1AssessmentDetail.assessmentdata = convertJsonDataToString(section1AssessmentDetail.assessmentdataAsJSON);
        assessDetailsToPersist.push(section1AssessmentDetail);
      }

      if (section2AssessmentDetail) {
        section2AssessmentDetail.assessmentdata = convertJsonDataToString(section2AssessmentDetail.assessmentdataAsJSON);
        assessDetailsToPersist.push(section2AssessmentDetail);
      }

      if (this.sectionThreeAssessmentDetail) {
        this.sectionThreeAssessmentDetail.assessmentdata = convertJsonDataToString(this.sectionThreeAssessmentDetail.assessmentdataAsJSON);
        assessDetailsToPersist.push(this.sectionThreeAssessmentDetail);
      }

      if (section4AssessmentDetail) {
        section4AssessmentDetail.assessmentdata = JSON.stringify({});
        assessDetailsToPersist.push(section4AssessmentDetail);
      }

      this.formAPIService.saveAssessmentDetails(this.actionMode, assessDetailsToPersist, (savedAssessmentDetails) => {
        if (savedAssessmentDetails && savedAssessmentDetails.length > 0) {
          this.preparePostSaveActionBasedOnStatus('success', true);
        } else {
          this.preparePostSaveActionBasedOnStatus('error');
        }

        this.showSaveStatusMessagePopup = true;
        this.showLoadingIndicator = false;
      });

      //Delete section 4 assessment detail if exists

      //Delete section 4 assessment tasks if exists
    });
  }

  preparePostSaveActionBasedOnStatus(status: string, showNextAction?: boolean) {

    this.postSaveAction(this.saveStatusMessagePopup, FORM_ONE_CONFIG.section_3_config.messages.SuccessSaveMessage,
      FORM_ONE_CONFIG.section_3_config.messages.ErrorSaveMessage,
      () => {
        this.showSaveStatusMessagePopup = false;
      },
      () => {
        this.showSaveStatusMessagePopup = false;
      },
      status, showNextAction,
      this.assessment);
  }

  computeCssForAction(defaultCls: any, optionToCompare: string) {
    return {
      ...defaultCls,
      'focus': this.sectionThreeVM.selectedYesNo === optionToCompare && this.readOnly,
      'active': this.sectionThreeVM.selectedYesNo === optionToCompare && this.readOnly,
      'action-btn-group-disabled': this.readOnly
    };
  }

}
