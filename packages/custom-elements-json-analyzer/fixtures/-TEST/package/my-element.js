// export class MyElement extends LitElement {
//   static properties = {
//     foo: { type: String, attribute: 'my-foo' }
//   }
// }

@Component({tag: 'hello-world'})
export class Button {
  @Prop()
  foo: string = 'hi'
}