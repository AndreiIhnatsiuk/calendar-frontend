import {ComponentFactoryResolver, Directive, Input, NgModule, TemplateRef, ViewContainerRef} from '@angular/core';
import {MatProgressSpinner, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ThemePalette} from '@angular/material/core';

@Directive({
  selector: '[appSpinOn]'
})
export class SpinOnDirective {
  #color: ThemePalette = 'primary';
  #diameter = 35;
  #isSpinning = null;
  #spinner: MatProgressSpinner = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input()
  set appSpinOnColor(color: ThemePalette) {
    this.#color = color;
    if (this.#spinner) {
      this.#spinner.color = color;
    }
  }

  @Input()
  set appSpinOnDiameter(diameter: number) {
    this.#diameter = diameter;
    if (this.#spinner) {
      this.#spinner.diameter = diameter;
    }
  }

  @Input() set appSpinOn(condition: boolean) {
    if (!!condition !== this.#isSpinning) {
      this.#spinner = null;
      this.viewContainer.clear();
      this.#isSpinning = condition;
      if (!condition) {
        // Render the template
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else if (condition) {
        this.addSpinner();
      }
    }
  }

  private addSpinner() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(MatProgressSpinner);
    const { instance } = this.viewContainer.createComponent<MatProgressSpinner>(componentFactory);
    instance.diameter = this.#diameter;
    instance.color = this.#color;
    instance.mode = 'indeterminate';
    instance._elementRef.nativeElement.classList.add('spin-on-instance');
    this.#spinner = instance;
  }
}

@NgModule({
  imports: [],
  declarations: [SpinOnDirective],
  exports: [SpinOnDirective, MatProgressSpinnerModule],
})
export class SpinOnModule {}
