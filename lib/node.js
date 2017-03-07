import {vec3, quat} from 'gl-matrix';

export default class Node {
  constructor () {
    this._id = ''; // TODO:

    this.name = '';
    this.localPosition = vec3.create();
    this.localScale = vec3.create();
    this.localRotation = quat.create();
  }

  get id () {
    return this._id;
  }
}