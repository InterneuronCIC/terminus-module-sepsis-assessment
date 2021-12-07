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


export class AssessmentTask {
  assessmenttask_id: string;
  sepsistask_id: string;
  taskdata: string;
  taskdataasobject: TaskData;
  sepsistasktemplateversionid: number;
  assessment_id: string;
  assessmentversionid: number;
  assessmentdetail_id:string;
  formsection_id:string;

}


export class TaskData {
  taskdata: TaskDataItem[];
}

export class TaskDataItem {
  taskKey: string;
  data: TaskDataItemValue;
}

export class TaskDataItemValue {
  [key: string]: any;
  meta: { key: string }[];
}