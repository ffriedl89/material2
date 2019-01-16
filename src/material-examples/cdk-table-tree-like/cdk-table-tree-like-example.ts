import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Directive,
  SkipSelf
} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';
import {FlatTreeControl, CdkTreeNode, CdkTree, TreeControl, CdkTreeNodeToggle} from '@angular/cdk/tree';
import {MatTreeFlattener, MatTreeFlatDataSource} from '@angular/material/tree';
import {
  CDK_ROW_TEMPLATE,
  CdkRow,
  CDK_TABLE_TEMPLATE,
  CdkTable,
  CdkCell,
} from '@angular/cdk/table';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

/**
 * File node data with nested structure.
 * Each node has a filename, and a type or a list of children.
 */
export class FileNode {
  children: FileNode[];
  filename: string;
  type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
  constructor(
    public expandable: boolean, public filename: string, public level: number, public type: any) {}
}

/**
 * The file structure tree data in string. The data could be parsed into a Json object
 */
const TABLE_DATA: FileNode[] = [
  {
    filename: 'Applications',
    type: 'dir',
    children: [
      {
        filename: 'Calendar',
        type: 'app',
        children: [],
      },
      {
        filename: 'Chrome',
        type: 'app',
        children: [],
      },
      {
        filename: 'Webstorm',
        type: 'app',
        children: [],
      }
    ],
  },
  {
    filename: 'Downloads',
    type: 'dir',
    children: [
      {
        filename: 'October',
        type: 'pdf',
        children: [],
      },
      {
        filename: 'Nobember',
        type: 'pdf',
        children: [],
      },
      {
        filename: 'Tutorial',
        type: 'html',
        children: [],
      },
    ],
  },
];

/**
 * @title Tree like cdk data-table
 */
@Component({
  selector: 'cdk-table-tree-like-example',
  styleUrls: ['cdk-table-tree-like-example.css'],
  templateUrl: 'cdk-table-tree-like-example.html',
})
export class CdkTableTreeLikeExample {
  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;

  constructor() {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
    this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.dataSource.data = TABLE_DATA;
  }

  hasChild = (_: number, _nodeData: FileFlatNode) => _nodeData.expandable;

  transformer = (node: FileNode, level: number) => {
    return new FileFlatNode(!!node.children, node.filename, level, node.type);
  }

  private _getLevel = (node: FileFlatNode) => node.level;

  private _isExpandable = (node: FileFlatNode) => node.expandable;

  private _getChildren = (node: FileNode): Observable<FileNode[]> => observableOf(node.children);
}


/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'custom-row, tr[custom-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'custom-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'customRow',
  providers: [
    {provide: CdkRow, useExisting: CustomRow},
    {provide: CdkTreeNode, useExisting: CustomRow}
  ],
})
export class CustomRow<T> extends CdkRow<T> { }

/**
 * Wrapper for the CdkTable.
 */
@Component({
  selector: 'custom-table, table[custom-table]',
  exportAs: 'customTable',
  template: CDK_TABLE_TEMPLATE,
  host: {
    'class': 'custom-table',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CdkTree, useExisting: CustomTable }]
})
export class CustomTable<T> extends CdkTable<T> {
  @Input() treeControl: TreeControl<T>;
}

/**
 * Custom cell
 */
@Directive({
  selector: 'custom-cell, td[custom-cell]',
  exportAs: 'customCell',
  host: {
    'class': 'custom-cell',
  },
})
export class CustomCell extends CdkCell {
}

/**
 * Node toggle to expand/collapse the node.
 */
@Directive({
  selector: '[customTreeNodeToggle]',
  host: {
    '(click)': '_toggle($event)',
  }
})
export class CustomTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {
  /** Whether expand/collapse the node recursively. */
  @Input('customTreeNodeToggleRecursive')
  get recursive(): boolean { return this._recursive; }
  set recursive(value: boolean) { this._recursive = coerceBooleanProperty(value); }
  protected _recursive = false;

  constructor(protected _tree: CdkTree<T>, @SkipSelf() protected _row: CdkTreeNode<T>) {
    super(_tree, _row);
  }

  _toggle(event: Event): void {
    super._toggle(event);
  }
}