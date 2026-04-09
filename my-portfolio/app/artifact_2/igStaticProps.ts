import { GetStaticProps } from 'next';
import { ArtifactData } from '../utility/ArtifactData';
import { codeToHtml } from 'shiki';

export const getInspectorGadgetCode = async(): Promise<ArtifactData> => {

    const highlight = async (code: string) => {
        return await codeToHtml(code, {
            lang: 'python',
            theme: 'ayu-dark'
        })
    }

    const inspectorGadgetCode: ArtifactData = {
        'Feature Selection': {
            'Attack Map': {
                "content": "attack_map = {\n" +
                    "\t'BENIGN': 'BENIGN',\n" +
                    "\t'DDoS': 'DDoS',\n" +
                    "\t'DoS Hulk': 'DoS',\n" +
                    "\t'DoS GoldenEye': 'DoS',\n" +
                    "\t'DoS slowloris': 'DoS',\n" +
                    "\t'DoS Slowhttptest': 'DoS',\n" +
                    "\t'PortScan': 'Port Scan',\n" +
                    "\t'FTP-Patator': 'Brute Force',\n" +
                    "\t'SSH-Patator': 'Brute Force',\n" +
                    "\t'Bot': 'Bot',\n" +
                    "\t'Web Attack  Brute Force': 'Web Attack',\n" +
                    "\t'Web Attack  XSS': 'Web Attack',\n" +
                    "\t'Web Attack  Sql Injection': 'Web Attack',\n" +
                    "\t'Infiltration': 'Infiltration',\n" +
                    "\t'Heartbleed': 'Heartbleed'\n" +
                    "}\n" +
                    "data['Attack Type'] = data['Label'].map(attack_map)"
            },
            'Correlation Filter': {
                "content": "# Positive correlation features for 'Attack Number'\n" +
                    "corr = data.corr(numeric_only=True).round(2)\n" +
                    "pos_corr_features = corr['Attack Number'][\n" +
                    "\t(corr['Attack Number'] > 0) & (corr['Attack Number'] < 1)]\n" +
                    "pos_corr_features = pos_corr_features.sort_values(ascending=False)\n\n" +
                    "# Negative correlation features for 'Attack Number'\n" +
                    "neg_corr_features = corr['Attack Number'][\n" +
                    "\t(corr['Attack Number'] < 0) & (corr['Attack Number'] > -1)]\n" +
                    "neg_corr_features = neg_corr_features.sort_values(ascending=True)"
            },
            'Find Clusters': {
                "content": "# Build connected components from correlated pairs\n" +
                    "from collections import defaultdict\n\n" +
                    "def find_clusters(pairs, features):\n" +
                    "\t# Build adjacency list\n" +
                    "\tgraph = defaultdict(set)\n" +
                    "\tfor a, b, val in pairs:\n" +
                    "\t\tgraph[a].add(b)\n" +
                    "\t\tgraph[b].add(a)\n\n" +
                    "\t# Find connected components via BFS\n" +
                    "\tvisited = set()\n" +
                    "\tclusters = []\n\n" +
                    "\tfor feature in features:\n" +
                    "\t\tif feature in visited or feature not in graph:\n" +
                    "\t\t\tcontinue\n" +
                    "\t\tcluster = set()\n" +
                    "\t\tqueue = [feature]\n" +
                    "\t\tvisited.add(feature)\n" +
                    "\t\twhile queue:\n" +
                    "\t\t\tnode = queue.pop()\n" +
                    "\t\t\tcluster.add((node, corr['Attack Number'][node]))\n" +
                    "\t\t\tfor neighbor in graph[node] - visited:\n" +
                    "\t\t\t\tvisited.add(neighbor)\n" +
                    "\t\t\t\tqueue.append(neighbor)\n" +
                    "\t\tclusters.append(cluster)\n\n" +
                    "\treturn clusters"
            },
            'Drop Full Flow Features': {
                "content": "# Drop features that require complete flow statistics (unusable at\n" +
                    "# inference time on a sliding window of packets)\n" +
                    "drop = {'Bwd Packet Length Mean', 'Packet Length Mean',\n" +
                    "\t\t'Bwd Packet Length Max', 'Idle Mean', 'Max Packet Length',\n" +
                    "\t\t'Fwd IAT Max', 'Idle Min', 'Idle Max', 'Flow IAT Max',\n" +
                    "\t\t'Flow Duration'}\n" +
                    "all_kept_feat = [f for f in all_kept_feat if f not in drop]"
            }
        },
        'Preprocessing': {
            'Drop Minority Classes': {
                "content": "# Heartbleed (11 records) and Infiltration cannot be meaningfully\n" +
                    "# synthesized with SMOTE - drop them and reshape to 7 classes\n" +
                    "data = data[-data['Attack Type'].isin(['Heartbleed', 'Infiltration'])]"
            },
            'Downsample Benign': {
                "content": "# Separate benign flows from attacks\n" +
                    "benign = data.loc[data['Attack Type'] == 'BENIGN']\n" +
                    "attacks = data.loc[data['Attack Type'] != 'BENIGN']\n\n" +
                    "# Down sample BENIGN to match total attack count\n" +
                    "benign = benign.sample(n=len(attacks), replace=False)\n\n" +
                    "# Combine new distribution and shuffle\n" +
                    "new_data = pd.concat([benign, attacks])\n" +
                    "new_data = new_data.sample(frac=1, random_state=40).reset_index(drop=True)"
            },
            'Train Val Test Split': {
                "content": "from sklearn.model_selection import train_test_split\n\n" +
                    "X = new_data.drop(columns=['Attack Type']).values.astype(np.float32)\n" +
                    "y = new_data['Attack Type'].values\n\n" +
                    "# 80/20 train and temp split (stratified)\n" +
                    "X_train, X_temp, y_train, y_temp = train_test_split(\n" +
                    "\tX, y, test_size=0.2, random_state=42, stratify=y)\n\n" +
                    "# Split temp evenly into validation and test\n" +
                    "X_val, X_test, y_val, y_test = train_test_split(\n" +
                    "\tX_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp)"
            },
            'Scale and Persist': {
                "content": "# Normalize data using sklearn's standard scaler\n" +
                    "scaler = StandardScaler()\n" +
                    "scaler.fit(X_train)  # fit on train only to prevent data leakage\n" +
                    "X_train = scaler.transform(X_train)\n" +
                    "X_val = scaler.transform(X_val)\n" +
                    "X_test = scaler.transform(X_test)\n\n" +
                    "# Save scaler for reuse in the inference model on the Pi\n" +
                    "import joblib\n" +
                    "joblib.dump(scaler, 'NMMscaler.joblib')"
            },
            'SMOTE': {
                "content": "# Oversample the three smallest attack classes with SMOTE\n" +
                    "from imblearn.over_sampling import SMOTE\n\n" +
                    "# k_neighbors=15 widens the neighborhood SMOTE draws from,\n" +
                    "# producing more variable synthetic samples\n" +
                    "sm = SMOTE(\n" +
                    "\tsampling_strategy={'Brute Force': 64064, 'Web Attack': 15001, 'Bot': 13671},\n" +
                    "\trandom_state=42,\n" +
                    "\tk_neighbors=15)\n" +
                    "X_train, y_train = sm.fit_resample(X_train, y_train)"
            }
        },
        'Encoding': {
            'Label Encoder': {
                "content": "# Integer encoding for numerical representation\n" +
                    "le = LabelEncoder()\n" +
                    "y_train = le.fit_transform(y_train)\n" +
                    "y_val = le.transform(y_val)\n" +
                    "y_test = le.transform(y_test)\n" +
                    "joblib.dump(le, 'NMMlabel_encoder.joblib')\n\n" +
                    "# One-hot encoding for categorical_crossentropy loss\n" +
                    "y_train = to_categorical(y_train, CLASSES)\n" +
                    "y_val = to_categorical(y_val, CLASSES)\n" +
                    "y_test = to_categorical(y_test, CLASSES)"
            }
        },
        'Model': {
            'Architecture': {
                "content": "model = Sequential(name='Inspector_Gadget')\n" +
                    "model.add(Input(shape=(FEATURES,)))\n" +
                    "model.add(Dense(FIRST_LAYER, activation='relu'))   # 250\n" +
                    "model.add(BatchNormalization())\n" +
                    "model.add(Dropout(DROPOUT))\n" +
                    "model.add(Dense(SECOND_LAYER, activation='relu'))  # 100\n" +
                    "model.add(BatchNormalization())\n" +
                    "model.add(Dropout(DROPOUT))\n" +
                    "model.add(Dense(THIRD_LAYER, activation='relu'))   # 50\n" +
                    "model.add(Dense(CLASSES, activation='softmax'))    # 7"
            },
            'Compile and Train': {
                "content": "# Compile with a full suite of metrics to see past accuracy alone\n" +
                    "model.compile(loss='categorical_crossentropy', optimizer=OPTIMIZER, metrics=[\n" +
                    "\t'accuracy',                       # overall correctness\n" +
                    "\ttf.keras.metrics.Precision(),     # identifies false positives\n" +
                    "\ttf.keras.metrics.Recall(),        # identifies false negatives\n" +
                    "\ttf.keras.metrics.AUC(name='auc')  # separation between classes\n" +
                    "])\n\n" +
                    "# EarlyStopping rolls back to the best weights if val_loss stalls\n" +
                    "from tensorflow.keras.callbacks import EarlyStopping\n" +
                    "early_stop = EarlyStopping(\n" +
                    "\tmonitor='val_loss',\n" +
                    "\tmin_delta=1e-4,\n" +
                    "\tpatience=3,\n" +
                    "\tmode='min',\n" +
                    "\trestore_best_weights=True)\n\n" +
                    "history = model.fit(\n" +
                    "\tX_train, y_train,\n" +
                    "\tbatch_size=BATCH_SIZE,\n" +
                    "\tepochs=EPOCHS,\n" +
                    "\tvalidation_data=(X_val, y_val),\n" +
                    "\tcallbacks=[early_stop])"
            }
        },
        'Quantization': {
            'Calibration Data': {
                "content": "# Balanced per-class calibration data for INT8 quantization\n" +
                    "y_train_labels = np.argmax(y_train, axis=1)\n" +
                    "Nper_class = 50\n" +
                    "indices = []\n" +
                    "for label in np.unique(y_train_labels):\n" +
                    "\tclass_indices = np.where(y_train_labels == label)[0]\n" +
                    "\tsamples = np.random.choice(class_indices, Nper_class, replace=False)\n" +
                    "\tindices.append(samples)\n" +
                    "indices = np.concatenate(indices)\n" +
                    "np.random.shuffle(indices)\n" +
                    "calibration_data = X_train[indices]\n\n" +
                    "def representative_dataset():\n" +
                    "\tfor data in calibration_data:\n" +
                    "\t\tyield [data.reshape(1, 19)]"
            },
            'Convert to TFLite': {
                "content": "# Post-training INT8 quantization for Raspberry Pi deployment\n" +
                    "converter = tf.lite.TFLiteConverter.from_keras_model(model)\n" +
                    "converter.optimizations = [tf.lite.Optimize.DEFAULT]\n" +
                    "converter.representative_dataset = representative_dataset\n" +
                    "converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]\n" +
                    "tflite_quant_model = converter.convert()\n\n" +
                    "with open('Inspector_Gadget_quant.tflite', 'wb') as f:\n" +
                    "\tf.write(tflite_quant_model)"
            }
        }
    }

    for (const className in inspectorGadgetCode) {
        for (const functionName in inspectorGadgetCode[className]) {
            for (const contentSection in inspectorGadgetCode[className][functionName]) {
                const code = inspectorGadgetCode[className][functionName][contentSection];
                inspectorGadgetCode[className][functionName][contentSection] = await highlight(code);
            }
        }
    }

    return inspectorGadgetCode;
}
