import type { ArtifactData } from '../utility/ArtifactData';
import { getInspectorGadgetCode } from './igStaticProps';

export default async function Artifact_2() {

  const igCode: ArtifactData = await getInspectorGadgetCode();

  const attackMap      = igCode['Feature Selection']?.['Attack Map']?.['content'];
  const corrFilter     = igCode['Feature Selection']?.['Correlation Filter']?.['content'];
  const findClusters   = igCode['Feature Selection']?.['Find Clusters']?.['content'];
  const dropFullFlow   = igCode['Feature Selection']?.['Drop Full Flow Features']?.['content'];
  const dropMinority   = igCode['Preprocessing']?.['Drop Minority Classes']?.['content'];
  const downsample     = igCode['Preprocessing']?.['Downsample Benign']?.['content'];
  const trainValTest   = igCode['Preprocessing']?.['Train Val Test Split']?.['content'];
  const scaleAndPersist = igCode['Preprocessing']?.['Scale and Persist']?.['content'];
  const smote          = igCode['Preprocessing']?.['SMOTE']?.['content'];
  const labelEncoder   = igCode['Encoding']?.['Label Encoder']?.['content'];
  const architecture   = igCode['Model']?.['Architecture']?.['content'];
  const compileAndTrain = igCode['Model']?.['Compile and Train']?.['content'];
  const calibrationData = igCode['Quantization']?.['Calibration Data']?.['content'];
  const convertTFLite  = igCode['Quantization']?.['Convert to TFLite']?.['content'];

  return (
    <main className="flex flex-col p-5 w-full mx-auto lg:max-w-[1600px]">

      <h1 className="text-center">
        Inspector Gadget ANN
      </h1>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1">
          <h3 className="mt-5 text-center">Where This Started</h3>
          <p className="indent-10">
            The original artifact for this submission is a Jupyter notebook from CS 370
            Current/Emerging Trends in CS, where I was first introduced to artificial neural 
            networks using Keras. That assignment used a small, scaffolded dataset to 
            demonstrate forward propagation and gradient descent. It was functional, but the 
            problem it solved was synthetic. If you would like to view both the original and 
            enhanced artifacts you can see them in this GitHub repo <a target="_blank"
            href="https://github.com/NebuFlux/nebuflux.github.io/tree/main/ANN_modeling">here</a>.
          </p>
          <h3 className="mt-5 lg:mt-18 text-center">Teaching a Machine to Recognize Threats</h3>
          <p className="indent-10">
            The enhancement replaces that proof-of-concept with a production-grade
            multi-class classifier trained on real labeled network traffic from the
            CIC-IDS2017 dataset and exports it to a quantized TFLite model that runs on
            a Raspberry Pi 4. Every preprocessing decision, every architectural choice,
            and every metric I tracked was made with one constraint in mind: this model
            has to be accurate enough to be useful for real-time intrusion detection,
            and fast enough to run on edge hardware without missing packets.
          </p>
        </div>
        <div className="flex flex-col lg:flex-1 min-w-0 gap-2">
          <h3 className="mt-5 text-center">Feature Selection</h3>
          <p className="indent-10">
            The CIC-IDS2017 dataset has 80 feature columns and 15 attack
            categories. Neither number is useful as-is. The first task was
            consolidating the attack labels. Fourteen attack subtypes, including DoS Hulk,
            DoS GoldenEye, FTP-Patator, and Web Attack XSS, collapse into
            seven broader classes. Two categories, Heartbleed and Infiltration, are
            too rare to model reliably (Heartbleed has only 11 records in the full
            dataset), so they are dropped entirely in preprocessing. The mapping is
            explicit: every label in the raw data maps to a known target class, and
            anything unrecognized surfaces immediately as a null rather than being
            silently misclassified. Many thanks to <a target="_blank" href = "https://github.com/noushinpervez"
            >Noushin Pervez</a>{' '}
            for her work on preprocessing and feature correlation. You can check 
            out her CIC-IDS2017 repo <a target="_blank" href = "https://github.com/noushinpervez/Intrusion-Detection-CICIDS2017/blob/main/Intrusion-Detection-CIC-IDS2017.ipynb"
            >here</a>.
          </p>
          <div key={'Attack Map'} className=" max-w-full rounded-xl
          overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: attackMap}}
          />
        </div>
      </div>

      <div className="grid grid-flow-row grid-cols-1 lg:grid-cols-2 my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div key={'Find Clusters'} className="order-2 lg:order-1 lg:row-span-4 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: findClusters}}
        />
        <p className="indent-10 order-1 lg:order-2 lg:col-start-2">
          With clean labels, the next step is reducing 80 features to a set that
          is predictive and not redundant. The approach is correlation-driven:
          compute the Pearson correlation of every numeric feature against a
          numeric encoding of the attack class, then keep features with meaningful signal, whether positive or negative,
          and discard the rest.
        </p>
        <p className="indent-10 mt-5 order-3 lg:row-start-2 lg:col-start-2">
          Correlated features don't just correlate with the label. They often
          correlate with each other as well. Keeping both members of a redundant pair
          inflates the feature vector without adding information. To handle this,
          I built a graph where each node is a feature and each edge connects two
          features with high mutual correlation. A BFS over this graph yields
          connected components, which are clusters of features that tell the same story.
          From each cluster, only the member with the strongest correlation to
          the target label is kept; the rest are dropped.
        </p>
        <div key={'Correlation Filter'} className="order-4 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: corrFilter}}
        />
      </div>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        
      </div>

      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        
      </div>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The last feature selection step was the most deployment-critical.
          Several features in the dataset, including <em>Flow Duration</em>,
          <em> Idle Mean</em>, and <em>Max Packet Length</em>, can only be computed
          once a flow is fully complete. The state machine on the Pi processes
          packets in sliding windows, not complete flows, so these features are
          unavailable at inference time. Keeping them in training would produce
          a model that scores well in the notebook but is impossible to serve
          on the Pi. They were dropped.
        </p>
        <div key={'Drop Full Flow'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: dropFullFlow}}
        />
      </div>

      <h3 className="mt-10 text-center">Handling Imbalanced Data</h3>
      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          CIC-IDS2017 is heavily imbalanced. BENIGN traffic accounts for roughly
          80% of all records, while Brute Force, Web Attack, and Bot each represent
          less than 1%. A model trained on this raw distribution learns to predict
          BENIGN for almost everything and still reports high accuracy. That is not
          a useful intrusion detector. Heartbleed and Infiltration are dropped first
          because they're far too rare for SMOTE to synthesize meaningful samples.
          With only 11 Heartbleed records in the entire dataset, any synthetic
          neighbor would be nearly identical to the original.
        </p>
        <div key={'Drop Minority'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: dropMinority}}
        />
      </div>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1 min-w-0 gap-2">
          <p className="indent-10">
            For the remaining six attack classes I used a two-phase balancing
            strategy. First, BENIGN is downsampled to match the total attack
            count, cutting the dataset to a manageable size without discarding
            any attack records.
          </p>
          <div key={'Downsample'} className="max-w-full rounded-xl
          overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: downsample}}
          />
          <p className="indent-10">
            For the three smallest attack classes, Brute Force, Web Attack,
            and Bot, downsampling Benign alone isn't enough because of the 
            massive disparity between these three and the others. SMOTE generates 
            synthetic training samples by interpolating between existing 
            minority examples and their k-nearest neighbors. Setting 
            <code> k_neighbors=15</code> widens the neighborhood, producing
            more varied synthetic samples and reducing the risk of overfitting 
            to the original minority points.
          </p>
          <div key={'SMOTE'} className="max-w-full rounded-xl
          overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: smote}}
          />
        </div>
        <div key={'Train Val Test'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: trainValTest}}
        />
      </div>

      <h3 className="mt-10 text-center">Scaling Without Leaking</h3>
      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          Before any data reaches the model it passes through a
          <code> StandardScaler</code> that normalizes each feature to zero mean
          and unit variance. The scaler is fitted on training data only. Fitting
          on the full dataset before the split would allow test-set statistics to
          influence training, which introduces bias and decreases precision in
          production. The fitted scaler is saved to disk so the Pi can apply the 
          exact same transformation at inference time. A scaler mismatch
          would corrupt every prediction made during inference.
        </p>
        <div key={'Scale and Persist'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: scaleAndPersist}}
        />
      </div>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The target labels are encoded twice: first with <code>LabelEncoder </code>
          to assign a stable integer to each class in alphabetical order, then with
          <code> to_categorical</code> to produce a one-hot vector for
          <code> categorical_crossentropy</code> loss. The <code>LabelEncoder </code>
          is also saved with joblib for use in deployment. The index mapping, where 
          0 is BENIGN, 1 is Bot, and so on, must be identical in training and at 
          inference time, or the model will output the correct index for the wrong 
          class label.
        </p>
        <div key={'Label Encoder'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: labelEncoder}}
        />
      </div>

      <h3 className="mt-10 text-center">Architecture and Training</h3>
      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The network is a three-hidden-layer feedforward Aritficial Neural Network with 
          Rectified Linear Unit (ReLU) activations, BatchNormalization after the first two layers 
          to stabilize training, and Dropout for regularization. Layer widths step down 
          from 250 to 100 to 50, forming a funnel shape that forces the network to compress 
          the 19 input features into progressively more abstract representations before 
          the 7-class softmax output. The architecture is deliberately modest: deep enough to capture
          non-linear boundaries between attack classes, small enough to quantize
          cleanly and run on the Pi without latency problems.
        </p>
        <div key={'Architecture'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: architecture}}
        />
      </div>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          Accuracy alone is not a useful metric for an intrusion detector. A model
          that predicts BENIGN for everything would report high accuracy on any
          dataset where BENIGN dominates. I tracked Precision, Recall, and the Area
          Under the Curve (AUC) alongside accuracy to keep the full picture visible. 
          Precision measures false positives, which are alerts that aren't real 
          threats. Recall measures false negatives, the real threats that went 
          undetected. For a security tool, a missed threat is the more dangerous 
          failure mode. Training uses <code>EarlyStopping</code> on <code>val_loss </code> 
          with patience of 3, which rolls back to the best weights automatically 
          if validation loss stops improving.
        </p>
        <div key={'Compile and Train'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: compileAndTrain}}
        />
      </div>

      <h3 className="mt-10 text-center">Quantization for the Edge</h3>
      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The trained model runs at full float32 precision on a desktop GPU, but
          the Raspberry Pi 4 has no GPU and limited memory bandwidth. Post-training
          integer quantization converts weights and activations from 32-bit floats
          to 8-bit integers, reducing model size by roughly 4× and significantly
          improving inference throughput on ARM hardware. The quantization is
          data-aware: a representative dataset drawn from the training split tells
          the converter the actual dynamic range of each activation so it can choose
          the right scale factors. To avoid calibrating on only the majority class,
          the calibration set is balanced at 50 samples per class, drawn randomly.
        </p>
        <div key={'Calibration Data'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: calibrationData}}
        />
      </div>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The converter is configured for full integer quantization using{' '}
          <code>TFLITE_BUILTINS_INT8</code>, which constrains every operation
          in the graph to integer arithmetic, not just the weights. This produces
          the most aggressive size and speed reduction and is the format the
          Raspberry Pi's XNNPACK runtime can accelerate. The output is a single{' '}
          <code>.tflite</code> file that the state machine loads via {' '}
          <code>tf.lite.Interpreter</code> at startup.
        </p>
        <div key={'Convert to TFLite'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: convertTFLite}}
        />
      </div>

      <h3 className="text-center mt-10">Conclusions</h3>
      <div className="flex flex-col items-center">
      <p className="indent-10 lg:max-w-1/2 ">
        This enhancement demonstrates the ability to use well-founded techniques
        for designing and evaluating computing solutions. The feature selection
        pipeline, which includes correlation filtering, cluster duplication purging,
        and relevant feature pruning, reflects an understanding that a model's value 
        is determined by how it behaves at inference time. Not how it scores in a 
        notebook. The preprocessing decisions around SMOTE and downsampling reflect 
        a deliberate choice to fix the data distribution rather than mask the 
        imbalance with a better-looking metric.
      </p>
      <p className="indent-10 lg:max-w-1/2 ">
        The most important lesson here was the gap between a model that trains well
        and a model that deploys well. Getting to 97% accuracy was straightforward
        once the data was clean and balanced. Getting the model to actually run on
        the Pi, quantized with the correct scaler and label encoder and producing
        correctly-mapped predictions, required careful attention to every artifact
        the training pipeline produces, not just the weights file. Every saved{' '}
        <code>.joblib</code> file is a contract between the notebook and the
        inference engine. Breaking that contract produces wrong predictions with
        no error message. By far the most difficult tasks deploying the model
        were the dependency management and smartly feeding it every single captured
        flow. For the first 24 hours of deployment while running tcpreplay the model 
        never seen an attack flow. Once I corrected this the model proved very reliable
        with a pcap from <a target="_blank" href="https://www.malware-traffic-analysis.net/"
        >Malware-Traffic_analysis.net</a>.
      </p>
      </div>

      <h3 className="mt-10">References</h3>
      <p>Canadian Institute for Cybersecurity. (2017). <em>CIC-IDS2017</em>. University of New Brunswick. <a target="_blank" href="https://www.unb.ca/cic/datasets/ids-2017.html">https://www.unb.ca/cic/datasets/ids-2017.html</a></p>
      <p>Chawla, N. V., Bowyer, K. W., Hall, L. O., &amp; Kegelmeyer, W. P. (2002). SMOTE: Synthetic minority over-sampling technique. <em>Journal of Artificial Intelligence Research, 16</em>, 321–357. <a target="_blank" href="https://doi.org/10.1613/jair.953">https://doi.org/10.1613/jair.953</a></p>
      <p>TensorFlow. (2024). <em>Post-training integer quantization</em>. <a target="_blank" href="https://www.tensorflow.org/lite/performance/post_training_integer_quant">https://www.tensorflow.org/lite/performance/post_training_integer_quant</a></p>
    </main>
  );
}
