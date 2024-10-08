import React from "react";
import { Tree, Input } from "antd";
import axios from "axios";

const TreeNode = Tree.TreeNode;
const Search = Input.Search;

const getParentKey = (title, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some((item) => item.title === title)) {
                parentKey = node.key;
            } else if (getParentKey(title, node.children)) {
                parentKey = getParentKey(title, node.children);
            }
        }
    }
    return parentKey;
};

const dataList = [];

const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const key = node.key;
        dataList.push({ key, title: node.title });
        if (node.children) {
            generateList(node.children);
        }
    }
};

class SearchTree extends React.Component {
    state = {
        expandedKeys: ["1"],
        searchValue: "",
        autoExpandParent: true,
        gData: [
            {
                title: "Gene List",
                key: "1",
            },
        ],
        loading: false,
    };
    constructor(props) {
        super(props);
    }

    onSelect = (selectedKeys, info) => {
        console.log("selected", selectedKeys, info);
        console.log("selected", this.props);
        this.props.onGetData(selectedKeys[0], info);
        console.log(this.state.expandedKeys);
    };

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    onSearch = (e) => {
        this.setState({
            loading: true,
        });
        let res = [];
        const url = `https://ontology.jax.org/api/network/search/gene?q=${e}&limit=-1`;

        return axios.get(url).then((response) => {
            console.log("Response data:", response.data.results.length);
            for (let i = 0; i < response.data.results.length; i++) {
                let item = response.data.results[i];
                item.key = item.id;
                item.title = item.id.substring(0, 7) + " " + item.name;
                res.push(item);
            }
            let newdata = [
                {
                    title: "Gene List",
                    key: "1",
                },
            ];
            newdata[0].children = res;
            this.setState({
                gData: newdata,
                loading: false,
            });
        });
    };

    onChange = (e) => {
        this.setState({
            loading: true,
        });
        let res = [];
        const url = `https://ontology.jax.org/api/network/search/gene?q=${e.target.value}&limit=100`;

        return axios.get(url).then((response) => {
            console.log("Response data:", response.data.results.length);
            for (let i = 0; i < response.data.results.length; i++) {
                let item = response.data.results[i];
                item.key = item.id;
                item.title = item.id + " - " + item.name;
                res.push(item);
            }
            let newdata = [
                {
                    title: "Gene List",
                    key: "1",
                },
            ];
            newdata[0].children = res;
            this.setState({
                gData: newdata,
                loading: false,
            });
        });
    };

    loop = (data) =>
        data.map((item) => {
            let { searchValue } = this.state;
            const index = item.title.indexOf(searchValue);
            const beforeStr = item.title.substr(0, index);
            const afterStr = item.title.substr(index + searchValue.length);
            const title =
                index > -1 ? (
                    <span>
                        {beforeStr}
                        <span style={{ color: "#f50" }}>{searchValue}</span>
                        {afterStr}
                    </span>
                ) : (
                    <span>{item.title}</span>
                );
            if (item.children) {
                return (
                    <TreeNode key={item.key} title={title} dataRef={item}>
                        {this.loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode dataRef={item} key={item.key} title={title} />;
        });

    render() {
        let { expandedKeys, autoExpandParent, gData, loading } = this.state;
        generateList(gData);
        return (
            <div style={{ marginBottom: "200px" }}>
                <Search
                    size="large"
                    style={{ marginBottom: 16 }}
                    placeholder="input search text"
                    onChange={this.onChange}
                    onSearch={this.onSearch}
                    loading={loading}
                />
                <Tree
                    onSelect={this.onSelect}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                >
                    {this.loop(gData)}
                </Tree>
            </div>
        );
    }
}

export default SearchTree;
