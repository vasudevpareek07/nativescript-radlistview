import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { ListViewLinearLayout, RadListView, LoadOnDemandListViewEventData, ListViewScrollDirection } from "nativescript-ui-listview";
import { android as androidApplication } from "tns-core-modules/application";
import { setTimeout } from "tns-core-modules/timer";
import { DataItem } from "./dataItem";
const homeData = require("./home.json");
const searchData = require("./search.json");
const accountData = require("./account.json");

@Component({
    selector: "Home",
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {


    private _dataItems: ObservableArray<DataItem> = new ObservableArray<DataItem>();;
    private _sourceDataItems: ObservableArray<DataItem>;
    private layout: ListViewLinearLayout;

    selectedSegment: number = 0;

    showLoader: boolean = true;

    constructor(private _changeDetectionRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.layout = new ListViewLinearLayout();
        this.layout.scrollDirection = ListViewScrollDirection.Vertical;
        this.initDataItems();
        this._changeDetectionRef.detectChanges();
        this.addItemsFromSource(5);
    }

    public get dataItems(): ObservableArray<DataItem> {
        return this._dataItems;
    }

    public addItemsFromSource(chunkSize: number) {
        let newItems = this._sourceDataItems.splice(0, chunkSize);
        this.dataItems.push(newItems);
        this.showLoader = false;
    }

    public onLoadMoreItemsRequested(args: LoadOnDemandListViewEventData) {
        console.log("load more requested");
        const that = new WeakRef(this);
        const listView: RadListView = args.object;
        if (this._sourceDataItems.length > 0) {
            setTimeout(function () {
                that.get().addMoreItemsFromSource(5);
                listView.notifyLoadOnDemandFinished();
            }, 500);
            args.returnValue = true;
        } else {
            args.returnValue = false;
            listView.notifyLoadOnDemandFinished(true);
        }
    }

    public addMoreItemsFromSource(chunkSize: number) {
        let newItems = this._sourceDataItems.splice(0, chunkSize);
        this.dataItems.push(newItems);
    }

    private initDataItems() {
        console.log("init items");
        switch(this.selectedSegment){
            case 0:
                this.setSourceDataItems(homeData);
                break;
            case 1:
                this.setSourceDataItems(accountData);
                break;
            case 2:
                this.setSourceDataItems(searchData);
                break;
            default:
                break;
        }
    }

    setSourceDataItems(data){
        this._sourceDataItems = new ObservableArray<DataItem>();
        for (let i = 0; i < data.names.length; i++) {
            if (androidApplication) {
                this._sourceDataItems.push(new DataItem(i, data.names[i], "This is item description", data.titles[i], data.text[i], "res://" + data.images[i].toLowerCase()));
            }
            else {
                this._sourceDataItems.push(new DataItem(i, data.names[i], "This is item description", data.titles[i], data.text[i], "res://" + data.images[i]));
            }
        }
    }

    selectedIndexChanged(args) {
        this.selectedSegment = args.newIndex;
        this.showLoader = true;
        this._dataItems = new ObservableArray<DataItem>();
        //setting timeout here, because in my application I am fetching the data from server.
        setTimeout(()=>{
            this.initDataItems();
            this.addItemsFromSource(5);
        }, 1000)
    }
}